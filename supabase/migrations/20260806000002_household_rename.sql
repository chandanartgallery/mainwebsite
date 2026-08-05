-- Keep Household display name for decorative-trays category
UPDATE public.categories
SET
  name = 'Household',
  description = 'Serving trays and tabletop pieces for everyday home styling.',
  image_url = 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png'
WHERE slug = 'decorative-trays';
