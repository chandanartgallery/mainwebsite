-- Chandan Art Gallery - PostgreSQL Database Schema Setup

-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    avatar_url text,
    phone text,
    role text default 'user' check (role in ('user', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Allow public read access to profiles" on public.profiles
    for select using (true);

create policy "Allow users to update their own profile" on public.profiles
    for update using (auth.uid() = id);

-- Trigger to create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- CATEGORIES TABLE
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    description text,
    image_url text,
    created_at timestamp with time zone default now() not null
);

alter table public.categories enable row level security;
create policy "Allow public read access to categories" on public.categories for select using (true);
create policy "Allow admin write access to categories" on public.categories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- SUBCATEGORIES TABLE
create table if not exists public.subcategories (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references public.categories on delete cascade not null,
    name text not null,
    slug text not null unique,
    description text,
    created_at timestamp with time zone default now() not null
);

alter table public.subcategories enable row level security;
create policy "Allow public read access to subcategories" on public.subcategories for select using (true);
create policy "Allow admin write access to subcategories" on public.subcategories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- PRODUCTS TABLE
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    sku text unique,
    description text,
    short_description text,
    category_id uuid references public.categories on delete set null,
    subcategory_id uuid references public.subcategories on delete set null,
    tags text[] default '{}',
    dimensions text,
    material text,
    weight text,
    color text,
    is_customizable boolean default false,
    is_featured boolean default false,
    is_trending boolean default false,
    is_best_seller boolean default false,
    seo_title text,
    seo_description text,
    seo_keywords text[] default '{}',
    opengraph_image text,
    price numeric, -- displayed starting price
    created_at timestamp with time zone default now() not null
);

alter table public.products enable row level security;
create policy "Allow public read access to products" on public.products for select using (true);
create policy "Allow admin write access to products" on public.products for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- PRODUCT IMAGES TABLE
create table if not exists public.product_images (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products on delete cascade not null,
    image_url text not null,
    is_primary boolean default false,
    display_order integer default 0,
    created_at timestamp with time zone default now() not null
);

alter table public.product_images enable row level security;
create policy "Allow public read access to product_images" on public.product_images for select using (true);
create policy "Allow admin write access to product_images" on public.product_images for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- WISHLIST TABLE
create table if not exists public.wishlist (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles on delete cascade not null,
    product_id uuid references public.products on delete cascade not null,
    created_at timestamp with time zone default now() not null,
    constraint uq_wishlist_user_product unique (user_id, product_id)
);

alter table public.wishlist enable row level security;
create policy "Allow users to view their own wishlist" on public.wishlist for select using (auth.uid() = user_id);
create policy "Allow users to insert into their own wishlist" on public.wishlist for insert with check (auth.uid() = user_id);
create policy "Allow users to delete from their own wishlist" on public.wishlist for delete using (auth.uid() = user_id);


-- CART TABLE
create table if not exists public.cart (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles on delete cascade not null,
    product_id uuid references public.products on delete cascade not null,
    quantity integer default 1 check (quantity > 0),
    variant text,
    created_at timestamp with time zone default now() not null
);

alter table public.cart enable row level security;
create policy "Allow users to view their own cart" on public.cart for select using (auth.uid() = user_id);
create policy "Allow users to insert into their own cart" on public.cart for insert with check (auth.uid() = user_id);
create policy "Allow users to update their own cart" on public.cart for update using (auth.uid() = user_id);
create policy "Allow users to delete from their own cart" on public.cart for delete using (auth.uid() = user_id);


-- INQUIRIES TABLE (WhatsApp and Contact submission)
create table if not exists public.inquiries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles on delete set null,
    product_id uuid references public.products on delete set null,
    name text,
    email text,
    phone text,
    message text,
    type text check (type in ('whatsapp', 'contact_form')),
    status text default 'pending' check (status in ('pending', 'replied', 'closed')),
    created_at timestamp with time zone default now() not null
);

alter table public.inquiries enable row level security;
create policy "Allow anyone to insert an inquiry" on public.inquiries for insert with check (true);
create policy "Allow users to read their own inquiries" on public.inquiries for select using (auth.uid() = user_id);
create policy "Allow admin full access to inquiries" on public.inquiries for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- REVIEWS TABLE
create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products on delete cascade not null,
    user_id uuid references public.profiles on delete cascade,
    user_name text not null,
    rating integer check (rating >= 1 and rating <= 5) not null,
    title text,
    comment text,
    images text[] default '{}',
    is_verified boolean default false,
    is_approved boolean default false,
    helpful_votes integer default 0,
    created_at timestamp with time zone default now() not null
);

alter table public.reviews enable row level security;
create policy "Allow public read access to approved reviews" on public.reviews for select using (is_approved = true);
create policy "Allow admin to read all reviews" on public.reviews for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Allow anyone to submit a review" on public.reviews for insert with check (true);
create policy "Allow admin full access to reviews" on public.reviews for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- COMMENTS TABLE (Nested replies)
create table if not exists public.product_comments (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products on delete cascade not null,
    user_id uuid references public.profiles on delete cascade,
    user_name text not null,
    comment text not null,
    parent_id uuid references public.product_comments on delete cascade,
    is_approved boolean default false,
    created_at timestamp with time zone default now() not null
);

alter table public.product_comments enable row level security;
create policy "Allow public read access to approved comments" on public.product_comments for select using (is_approved = true);
create policy "Allow admin to read all comments" on public.product_comments for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Allow registered users to submit comments" on public.product_comments for insert with check (auth.uid() is not null);
create policy "Allow admin full access to comments" on public.product_comments for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- BLOG CATEGORIES
create table if not exists public.blog_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    created_at timestamp with time zone default now() not null
);

alter table public.blog_categories enable row level security;
create policy "Allow public read access to blog_categories" on public.blog_categories for select using (true);
create policy "Allow admin full access to blog_categories" on public.blog_categories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- BLOG POSTS TABLE
create table if not exists public.blog_posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    content text not null,
    category_id uuid references public.blog_categories on delete set null,
    tags text[] default '{}',
    featured_image text,
    reading_time integer default 0,
    is_published boolean default false,
    seo_title text,
    seo_description text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

alter table public.blog_posts enable row level security;
create policy "Allow public read access to published posts" on public.blog_posts for select using (is_published = true);
create policy "Allow admin to read all posts" on public.blog_posts for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Allow admin full access to blog posts" on public.blog_posts for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- TESTIMONIALS TABLE
create table if not exists public.testimonials (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    role text,
    rating integer default 5 check (rating >= 1 and rating <= 5),
    comment text not null,
    avatar_url text,
    created_at timestamp with time zone default now() not null
);

alter table public.testimonials enable row level security;
create policy "Allow public read access to testimonials" on public.testimonials for select using (true);
create policy "Allow admin full access to testimonials" on public.testimonials for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- BANNERS TABLE
create table if not exists public.banners (
    id uuid primary key default gen_random_uuid(),
    title text,
    subtitle text,
    image_url text not null,
    link_url text,
    display_order integer default 0,
    is_active boolean default true,
    created_at timestamp with time zone default now() not null
);

alter table public.banners enable row level security;
create policy "Allow public read access to banners" on public.banners for select using (is_active = true);
create policy "Allow admin full access to banners" on public.banners for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- ANALYTICS EVENTS TABLE
create table if not exists public.analytics_events (
    id uuid primary key default gen_random_uuid(),
    event_type text not null, -- 'page_view', 'product_click', 'whatsapp_click', 'wishlist_add', 'search'
    product_id uuid references public.products on delete set null,
    path text,
    search_query text,
    device text,
    browser text,
    referrer text,
    scroll_depth integer,
    session_id text,
    created_at timestamp with time zone default now() not null
);

alter table public.analytics_events enable row level security;
create policy "Allow anyone to insert analytics events" on public.analytics_events for insert with check (true);
create policy "Allow admin full access to analytics events" on public.analytics_events for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- Create indexes for performance optimization
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_analytics_events_type on public.analytics_events(event_type);
create index if not exists idx_inquiries_type on public.inquiries(type);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_comments_product on public.product_comments(product_id);
