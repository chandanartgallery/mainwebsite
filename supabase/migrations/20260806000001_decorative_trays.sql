-- Decorative Trays category + 7 tray products (storage bucket: products/2..8)

-- Category
INSERT INTO public.categories (id, name, slug, description, image_url)
VALUES (
  'c1000000-0000-0000-0000-000000000008',
  'Decorative Trays',
  'decorative-trays',
  'Hand-finished serving and display trays for dining, coffee tables, and styling — distinct patterns and materials for every home.',
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- Subcategory
INSERT INTO public.subcategories (id, category_id, name, slug, description)
VALUES (
  'd2000000-0000-0000-0000-000000000008',
  'c1000000-0000-0000-0000-000000000008',
  'Serving Trays',
  'serving-trays',
  'Everyday and statement trays for hosting, gifting, and tabletop display.'
)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id;

-- Products (folders 2–8 in public storage bucket "products")
INSERT INTO public.products (
  id, name, slug, sku, description, short_description,
  category_id, subcategory_id, tags, dimensions, material, weight, color,
  is_customizable, is_featured, is_trending, is_best_seller,
  seo_title, seo_description, seo_keywords, opengraph_image, price
) VALUES
(
  'a3000000-0000-0000-0000-000000000021',
  'Artisan Classic Serving Tray',
  'artisan-classic-serving-tray',
  'CAG-TRAY-002',
  'A clean, versatile serving tray with balanced proportions for tea, breakfast, or coffee-table styling. Smooth finish, easy to wipe, and designed to sit naturally with both modern and traditional interiors.',
  'Everyday classic tray for serving and tabletop display.',
  'c1000000-0000-0000-0000-000000000008',
  'd2000000-0000-0000-0000-000000000008',
  ARRAY['tray','serving','classic','home','tabletop'],
  'Approx. medium serve size',
  'Finished wood / laminate composite',
  '0.8 kg',
  'Natural warm tone',
  false, true, true, true,
  'Artisan Classic Serving Tray | Decorative Trays | Chandan Art Gallery',
  'Shop our classic artisan serving tray at ₹999. Ideal for tea service and coffee-table styling.',
  ARRAY['serving tray','decorative tray','home tray india'],
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png',
  999.00
),
(
  'a3000000-0000-0000-0000-000000000022',
  'Geometric Pattern Tray',
  'geometric-pattern-tray',
  'CAG-TRAY-003',
  'Bold geometric surface design that turns a practical tray into a styling piece. Use it for guests, vanity organisation, or as a centrepiece base for candles and ceramics.',
  'Statement tray with a crisp geometric print.',
  'c1000000-0000-0000-0000-000000000008',
  'd2000000-0000-0000-0000-000000000008',
  ARRAY['tray','geometric','pattern','modern','decor'],
  'Approx. medium serve size',
  'Printed surface on sturdy tray base',
  '0.8 kg',
  'Multi-tone geometric',
  false, true, false, false,
  'Geometric Pattern Tray | Decorative Trays | Chandan Art Gallery',
  'Modern geometric decorative tray for home styling and serving. Priced at ₹999.',
  ARRAY['geometric tray','pattern tray','modern home decor'],
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/3/1.png',
  999.00
),
(
  'a3000000-0000-0000-0000-000000000023',
  'Botanical Bloom Tray',
  'botanical-bloom-tray',
  'CAG-TRAY-004',
  'Soft botanical motifs for a calm, lived-in look. Perfect for breakfast in bed, festive sweets, or styling a console with flowers and books.',
  'Floral botanical tray for gentle everyday luxury.',
  'c1000000-0000-0000-0000-000000000008',
  'd2000000-0000-0000-0000-000000000008',
  ARRAY['tray','botanical','floral','gift','home'],
  'Approx. medium serve size',
  'Printed botanical finish',
  '0.8 kg',
  'Soft botanical palette',
  false, false, true, false,
  'Botanical Bloom Tray | Decorative Trays | Chandan Art Gallery',
  'Buy the botanical bloom serving tray — floral styling for home and gifting at ₹999.',
  ARRAY['floral tray','botanical tray','gift tray'],
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/4/1.png',
  999.00
),
(
  'a3000000-0000-0000-0000-000000000024',
  'Midnight Studio Tray',
  'midnight-studio-tray',
  'CAG-TRAY-005',
  'Deep, refined tones for contemporary spaces. A low-profile tray that anchors dark wood furniture, marble counters, and evening entertaining setups.',
  'Dark contemporary tray for modern interiors.',
  'c1000000-0000-0000-0000-000000000008',
  'd2000000-0000-0000-0000-000000000008',
  ARRAY['tray','dark','modern','studio','serving'],
  'Approx. medium serve size',
  'Matte / semi-matte studio finish',
  '0.8 kg',
  'Midnight / charcoal',
  false, true, false, true,
  'Midnight Studio Tray | Decorative Trays | Chandan Art Gallery',
  'Contemporary midnight-toned decorative tray for modern homes. ₹999.',
  ARRAY['dark tray','modern tray','studio tray'],
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/5/1.png',
  999.00
),
(
  'a3000000-0000-0000-0000-000000000025',
  'Heritage Motif Tray',
  'heritage-motif-tray',
  'CAG-TRAY-006',
  'Inspired by traditional craft motifs with a clean studio finish. Ideal for festive hosting, pooja essentials arrangement, or gifting with a cultural touch.',
  'Heritage-inspired tray for festive and everyday use.',
  'c1000000-0000-0000-0000-000000000008',
  'd2000000-0000-0000-0000-000000000008',
  ARRAY['tray','heritage','traditional','festive','gift'],
  'Approx. medium serve size',
  'Decorative motif finish',
  '0.8 kg',
  'Warm heritage tones',
  false, false, true, false,
  'Heritage Motif Tray | Decorative Trays | Chandan Art Gallery',
  'Heritage motif serving tray — festive-ready homeware at ₹999 from Chandan Art Gallery.',
  ARRAY['heritage tray','traditional tray','festive tray'],
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/6/1.png',
  999.00
),
(
  'a3000000-0000-0000-0000-000000000026',
  'Pastel Accent Tray',
  'pastel-accent-tray',
  'CAG-TRAY-007',
  'Light pastel accents for bedrooms, study desks, and soft-styled living rooms. Lightweight feel with a polished look that photographs beautifully.',
  'Soft pastel tray for light, airy interiors.',
  'c1000000-0000-0000-0000-000000000008',
  'd2000000-0000-0000-0000-000000000008',
  ARRAY['tray','pastel','accent','bedroom','decor'],
  'Approx. medium serve size',
  'Pastel decorative finish',
  '0.75 kg',
  'Soft pastel',
  false, false, false, false,
  'Pastel Accent Tray | Decorative Trays | Chandan Art Gallery',
  'Soft pastel accent tray for styling and serving. Available at ₹999.',
  ARRAY['pastel tray','accent tray','bedroom decor tray'],
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/7/1.png',
  999.00
),
(
  'a3000000-0000-0000-0000-000000000027',
  'Contemporary Line Tray',
  'contemporary-line-tray',
  'CAG-TRAY-008',
  'Minimal line-work design for design-forward homes and offices. Use it as a catchall by the entry, a desk organiser tray, or a serving piece for small bites.',
  'Minimal contemporary tray with clean line detailing.',
  'c1000000-0000-0000-0000-000000000008',
  'd2000000-0000-0000-0000-000000000008',
  ARRAY['tray','minimal','contemporary','line','office'],
  'Approx. medium serve size',
  'Line-detail decorative finish',
  '0.8 kg',
  'Neutral contemporary',
  false, true, true, false,
  'Contemporary Line Tray | Decorative Trays | Chandan Art Gallery',
  'Minimal contemporary line tray for home and desk styling. ₹999.',
  ARRAY['minimal tray','contemporary tray','desk tray'],
  'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/8/1.png',
  999.00
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  category_id = EXCLUDED.category_id,
  subcategory_id = EXCLUDED.subcategory_id,
  tags = EXCLUDED.tags,
  price = EXCLUDED.price,
  opengraph_image = EXCLUDED.opengraph_image,
  is_featured = EXCLUDED.is_featured,
  is_trending = EXCLUDED.is_trending,
  is_best_seller = EXCLUDED.is_best_seller;

-- Replace gallery images for these products
DELETE FROM public.product_images
WHERE product_id IN (
  'a3000000-0000-0000-0000-000000000021',
  'a3000000-0000-0000-0000-000000000022',
  'a3000000-0000-0000-0000-000000000023',
  'a3000000-0000-0000-0000-000000000024',
  'a3000000-0000-0000-0000-000000000025',
  'a3000000-0000-0000-0000-000000000026',
  'a3000000-0000-0000-0000-000000000027'
);

INSERT INTO public.product_images (product_id, image_url, is_primary, display_order) VALUES
-- folder 2
('a3000000-0000-0000-0000-000000000021', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png', true, 0),
('a3000000-0000-0000-0000-000000000021', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/2.png', false, 1),
('a3000000-0000-0000-0000-000000000021', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/3.png', false, 2),
-- folder 3
('a3000000-0000-0000-0000-000000000022', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/3/1.png', true, 0),
('a3000000-0000-0000-0000-000000000022', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/3/2.png', false, 1),
('a3000000-0000-0000-0000-000000000022', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/3/3.png', false, 2),
-- folder 4
('a3000000-0000-0000-0000-000000000023', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/4/1.png', true, 0),
('a3000000-0000-0000-0000-000000000023', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/4/2.png', false, 1),
('a3000000-0000-0000-0000-000000000023', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/4/3.png', false, 2),
-- folder 5
('a3000000-0000-0000-0000-000000000024', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/5/1.png', true, 0),
('a3000000-0000-0000-0000-000000000024', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/5/2.png', false, 1),
('a3000000-0000-0000-0000-000000000024', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/5/3.png', false, 2),
-- folder 6
('a3000000-0000-0000-0000-000000000025', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/6/1.png', true, 0),
('a3000000-0000-0000-0000-000000000025', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/6/2.png', false, 1),
('a3000000-0000-0000-0000-000000000025', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/6/3.png', false, 2),
-- folder 7
('a3000000-0000-0000-0000-000000000026', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/7/1.png', true, 0),
('a3000000-0000-0000-0000-000000000026', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/7/2.png', false, 1),
('a3000000-0000-0000-0000-000000000026', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/7/3.png', false, 2),
-- folder 8
('a3000000-0000-0000-0000-000000000027', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/8/1.png', true, 0),
('a3000000-0000-0000-0000-000000000027', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/8/2.png', false, 1),
('a3000000-0000-0000-0000-000000000027', 'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/8/3.png', false, 2);
