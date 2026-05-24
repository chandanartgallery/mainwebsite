-- Run this in Supabase SQL Editor to make every product-page element admin-configurable.
-- Adds product_config JSONB for UI copy, section labels, trust badges, etc.

alter table public.products
  add column if not exists product_config jsonb not null default '{}'::jsonb;

comment on column public.products.product_config is
  'Storefront UI: tagline, section labels, trust badges, story title, customizable copy';

-- Backfill sensible defaults for existing products (safe to re-run)
update public.products
set product_config = coalesce(product_config, '{}'::jsonb) || jsonb_build_object(
  'tagline', coalesce(product_config->>'tagline', 'Bespoke Framing Collection'),
  'storyTitle', coalesce(product_config->>'storyTitle', 'Artisan Story & Technical Details'),
  'customizableYesText', coalesce(product_config->>'customizableYesText', 'Yes — custom sizing available'),
  'customizableNoText', coalesce(product_config->>'customizableNoText', 'No'),
  'sectionLabels', coalesce(
    product_config->'sectionLabels',
  jsonb_build_object(
    'dimensions', 'Select Dimensions (Customizable)',
    'materials', 'Select Frame Wood / Material',
    'colors', 'Select Premium Color Finish'
  )),
  'trustBadges', coalesce(
    product_config->'trustBadges',
    jsonb_build_array(
      jsonb_build_object('icon', 'truck', 'title', 'Free Delivery', 'subtitle', 'Across India'),
      jsonb_build_object('icon', 'shield', 'title', 'Secured Frame', 'subtitle', 'Damage Protection'),
      jsonb_build_object('icon', 'authentic', 'title', '100% Genuine', 'subtitle', 'Teak & Pine Woods')
    )
  ),
  'badgeLabels', coalesce(
    product_config->'badgeLabels',
    jsonb_build_object('featured', 'Featured', 'bestSeller', 'Bestseller', 'trending', 'Trending')
  )
)
where product_config = '{}'::jsonb
   or product_config->>'tagline' is null;
