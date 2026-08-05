-- Production readiness: indexes + review uniqueness

CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user_product
  ON public.reviews (product_id, user_id);

CREATE INDEX IF NOT EXISTS inquiries_user_id_idx
  ON public.inquiries (user_id);

CREATE INDEX IF NOT EXISTS inquiries_status_created_idx
  ON public.inquiries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS products_slug_idx
  ON public.products (slug);

CREATE INDEX IF NOT EXISTS blog_posts_slug_published_idx
  ON public.blog_posts (slug)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS analytics_events_created_idx
  ON public.analytics_events (created_at DESC);
