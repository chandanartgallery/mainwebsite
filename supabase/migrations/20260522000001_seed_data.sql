-- Chandan Art Gallery - Seed Data SQL Script

-- Insert Categories
insert into public.categories (id, name, slug, description, image_url) values
('c1000000-0000-0000-0000-000000000001', 'Photo Frames', 'photo-frames', 'Premium handcrafted wooden and metallic photo frames for your cherished memories.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600'),
('c1000000-0000-0000-0000-000000000002', 'Custom Photo Frames', 'custom-photo-frames', 'Tailor-made frames built to match your exact dimensions, color preferences, and style.', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600'),
('c1000000-0000-0000-0000-000000000003', 'Acrylic Frames', 'acrylic-frames', 'Ultra-modern crystal clear acrylic prints with sleek wall mount standoff fixtures.', 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=600'),
('c1000000-0000-0000-0000-000000000004', 'Canvas Prints', 'canvas-prints', 'Premium texture canvas wraps with solid wood framing for high-end gallery representation.', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600'),
('c1000000-0000-0000-0000-000000000005', 'Religious Frames & Idols', 'religious-frames', 'Divine traditional Indian god frames, customized mandir decor, and premium gold-plated idols.', 'https://images.unsplash.com/photo-1609137144814-118e69d031e8?q=80&w=600'),
('c1000000-0000-0000-0000-000000000006', 'Home Decor & Wooden Art', 'home-decor', 'Exquisite handcrafted Indian wooden art, wall panels, premium wall art, and festive decor.', 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=600'),
('c1000000-0000-0000-0000-000000000007', 'Personalized Gifts', 'personalized-gifts', 'Thoughtful custom engraving, photo collages, and premium corporate gifting items.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600')
on conflict (slug) do update set
  description = excluded.description,
  image_url = excluded.image_url;

-- Insert Subcategories
insert into public.subcategories (id, category_id, name, slug, description) values
('d2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Teak Wood Frames', 'teak-wood-frames', 'Premium teak wood framing with natural matte finishes.'),
('d2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Classic Gold Frames', 'classic-gold-frames', 'Ornate gold-detailed traditional frames.'),
('d2000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', 'Ganesha & Lakshmi Frames', 'ganesha-lakshmi-frames', 'Auspicious frames for home entrance and mandirs.'),
('d2000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006', 'Mandir Decor & Jali Panels', 'mandir-decor', 'Exquisite CNC cut wooden mandir layouts and jali artwork.'),
('d2000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000007', 'Corporate Gifting Sets', 'corporate-gifting', 'Elegant leatherette and wooden premium gift sets.')
on conflict (slug) do update set
  description = excluded.description;

-- Insert Products
insert into public.products (id, name, slug, sku, description, short_description, category_id, subcategory_id, tags, dimensions, material, weight, color, is_customizable, is_featured, is_trending, is_best_seller, seo_title, seo_description, seo_keywords, opengraph_image, price) values
(
  'a3000000-0000-0000-0000-000000000001',
  'Classic Walnut Wooden Frame',
  'classic-walnut-wooden-frame',
  'CAG-WF-001',
  'This premium walnut wooden frame features high-quality solid pine wood imported from New Zealand. Handcrafted by local artisans, it displays rich dark brown grains, making it perfect for luxury residences and corporate settings alike. The front is fitted with museum-grade acrylic sheet to block out glare and UV light, ensuring long-lasting preservation of your favorite prints.',
  'Solid walnut wood luxury frame with anti-glare museum acrylic glass.',
  'c1000000-0000-0000-0000-000000000001',
  'd2000000-0000-0000-0000-000000000001',
  '{"walnut","wood","frame","modern","minimal"}',
  '12 x 15 inches',
  'Solid Pine Wood, Museum Acrylic',
  '1.2 kg',
  'Walnut Brown',
  true, true, false, true,
  'Buy Premium Classic Walnut Wooden Frame Online | Chandan Art Gallery',
  'Purchase our luxury handcrafted walnut wooden frame with anti-glare museum glass. Order custom sizes on WhatsApp.',
  '{"walnut wood frame","custom photo frames","luxury wood frame"}',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200',
  1499.00
),
(
  'a3000000-0000-0000-0000-000000000002',
  'Divine 24k Gold Plated Ganesha Frame',
  'divine-24k-gold-plated-ganesha-frame',
  'CAG-REL-002',
  'Elevate your home temple or welcome desk with this divine 24k gold-plated Ganesha idol enclosed in a premium teak wood shadow box frame. Crafted with traditional Rajasthani design accents, the background features high-quality red velvet backing to emphasize the gold craftsmanship. Ideal for housewarming gifts and corporate festive offerings.',
  '24k Gold Plated Ganesha idol in a luxurious teak wood shadow box.',
  'c1000000-0000-0000-0000-000000000005',
  'd2000000-0000-0000-0000-000000000005',
  '{"ganesha","gold-plated","religious","mandir","gift"}',
  '10 x 10 inches',
  'Teak Wood, 24k Gold Foil Plated Copper',
  '1.8 kg',
  'Gold & Crimson',
  false, true, true, true,
  'Divine 24k Gold Plated Ganesha Frame | Mandir Decor | Chandan Art Gallery',
  'Traditional gold plated Ganesha frame with red velvet background in premium teak frame. Order on WhatsApp.',
  '{"ganesha frame","gold plated frame","mandir frames","chandan art gallery"}',
  'https://images.unsplash.com/photo-1609137144814-118e69d031e8?q=80&w=1200',
  4999.00
),
(
  'a3000000-0000-0000-0000-000000000003',
  'Sleek Crystal Clear Acrylic Frame',
  'sleek-crystal-clear-acrylic-frame',
  'CAG-ACR-003',
  'Give your images a floating 3D dimension with our premium acrylic sandwich print. The package comes with double layer 3mm high-definition plexiglass sheets and four stainless steel mounting standoff screws. Ideal for high-end digital photography, marriage collages, and certificates.',
  'Floating double-acrylic frame with wall standoff fixtures.',
  'c1000000-0000-0000-0000-000000000003',
  null,
  '{"acrylic","floating","modern","standoff"}',
  '16 x 20 inches',
  'Premium Cast Plexiglass, Stainless Standoffs',
  '2.5 kg',
  'Crystal Clear',
  true, false, true, false,
  'Premium Floating Acrylic Sandwich Frames Online | Chandan Art Gallery',
  'Shop modern floating acrylic frames with premium stainless steel standoffs. Perfect for modern home interiors.',
  '{"acrylic photo frame","floating frame","modern wall frame"}',
  'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=1200',
  2499.00
),
(
  'a3000000-0000-0000-0000-000000000004',
  'Handcrafted Floral Wooden Jali Panel',
  'handcrafted-floral-wooden-jali-panel',
  'CAG-DEC-004',
  'Add rich traditional vibes to your living room walls with this handcrafted floral jali wood carving panel. Made of 100% seasoned mango wood with a distressed white-wash finish, it draws inspiration from classic Mughal architecture and can be hung vertically or horizontally.',
  'Seasoned mango wood Mughal floral jali wall panel with distressed finish.',
  'c1000000-0000-0000-0000-000000000006',
  'd2000000-0000-0000-0000-000000000006',
  '{"jali","mango wood","traditional","wall art","carving"}',
  '18 x 36 inches',
  'Seasoned Mango Wood',
  '3.4 kg',
  'Distressed White Wash',
  false, true, false, false,
  'Handcrafted Floral Wooden Jali Wall Panel | Chandan Art Gallery',
  'Purchase traditional Mughal floral design mango wood jali carving panels. Excellent wall art decoration.',
  '{"jali panel","wooden carving wall art","mango wood wall decor"}',
  'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1200',
  3799.00
),
(
  'a3000000-0000-0000-0000-000000000005',
  'Custom Gallery Wall Set of 6',
  'custom-gallery-wall-set-of-6',
  'CAG-COL-005',
  'Create your personal art exhibition with this curated set of six multi-sized classic black frames. Complete with premium acid-free paper mats, layout templates, and marking pins, this set takes the complexity out of displaying a cohesive photo gallery wall.',
  'Curated set of 6 multi-size matte black frames with photo mat boards.',
  'c1000000-0000-0000-0000-000000000002',
  null,
  '{"gallery wall","collage","black frames","set of 6"}',
  'Various (Templated Layout)',
  'Seasoned MDF, Glass Front',
  '4.1 kg',
  'Matte Black',
  true, false, true, true,
  'Custom Gallery Wall Frame Sets Online | Chandan Art Gallery',
  'Elevate your staircase or living room with our set of 6 matte black photo frames. Customize sizes on WhatsApp.',
  '{"gallery wall set","collage frames","black photo frames"}',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200',
  2999.00
)
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  short_description = excluded.short_description,
  price = excluded.price,
  is_featured = excluded.is_featured,
  is_trending = excluded.is_trending,
  is_best_seller = excluded.is_best_seller;

-- Insert Product Images
insert into public.product_images (id, product_id, image_url, is_primary, display_order) values
('f4000000-0000-0000-0000-000000000011', 'a3000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600', true, 0),
('f4000000-0000-0000-0000-000000000012', 'a3000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600', false, 1),
('f4000000-0000-0000-0000-000000000021', 'a3000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1609137144814-118e69d031e8?q=80&w=600', true, 0),
('f4000000-0000-0000-0000-000000000031', 'a3000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=600', true, 0),
('f4000000-0000-0000-0000-000000000041', 'a3000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=600', true, 0),
('f4000000-0000-0000-0000-000000000051', 'a3000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600', true, 0)
on conflict do nothing;

-- Insert Banners
insert into public.banners (id, title, subtitle, image_url, link_url, display_order, is_active) values
('b5000000-0000-0000-0000-000000000001', 'Capture Moments, Frame Memories', 'Luxury Handcrafted Photo Frames & Bespoke Wall Art Designs', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1920', '/shop', 0, true)
on conflict do nothing;

-- Insert Testimonials
insert into public.testimonials (id, name, role, rating, comment, avatar_url) values
('e6000000-0000-0000-0000-000000000001', 'Vikram Malhotra', 'Interior Architect', 5, 'Chandan Art Gallery has completely transformed our luxury villa projects. The finish on their teakwood frames and custom jali panels is unmatched. Simply world-class quality.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'),
('e6000000-0000-0000-0000-000000000002', 'Aanya Sharma', 'Homeowner', 5, 'Ordered a custom acrylic print and gallery wall set on WhatsApp. The team guided me on sizing and layout. Delivery was prompt and packaging was exceptionally secure!', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150')
on conflict do nothing;

-- Insert Blog Categories
insert into public.blog_categories (id, name, slug) values
('bc700000-0000-0000-0000-000000000001', 'Home Decor Insights', 'home-decor-insights'),
('bc700000-0000-0000-0000-000000000002', 'Framing Styles & Tips', 'framing-styles')
on conflict (slug) do update set name = excluded.name;

-- Insert Blog Posts
insert into public.blog_posts (id, title, slug, content, category_id, tags, featured_image, reading_time, is_published, seo_title, seo_description) values
(
  'a8000000-0000-0000-0000-000000000001',
  'The Art of Designing a Luxury Gallery Wall',
  'art-of-designing-luxury-gallery-wall',
  'Designing a gallery wall requires more than just hanging frames together. You must consider spacing, color coordination, and frame dimensions. To create a premium feel, mix solid walnut frames with classic matte black borders, utilizing thick mat board borders around your photos. This guides the viewer''s eye and provides breathing space between images. When planning a gallery wall, lay the frames on the floor first and play around with layouts before marking the wall. Adding an ornate religious piece at the center can anchor the composition and add emotional warmth.',
  'bc700000-0000-0000-0000-000000000002',
  '{"gallery wall","home decor","framing"}',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800',
  5, true,
  'Designing a Luxury Gallery Wall: Pro Tips | Chandan Art Gallery',
  'Learn how to curate, arrange, and hang a gorgeous premium photo gallery wall in your living room.'
),
(
  'a8000000-0000-0000-0000-000000000002',
  'Traditional Indian Wall Decor Trends in 2026',
  'traditional-indian-wall-decor-trends-2026',
  'Traditional Indian home decor is making a massive comeback with a modern global twist. Minimalist spaces are being elevated with statement pieces like mango wood floral jali carvings, metallic gold leaf god panels, and rich walnut wooden frames holding digital versions of traditional Tanjore art. In 2026, the trend is about combining glass and high-definition acrylics with raw, natural wood textures. Warm lighting inside mandirs, reflected off 24k gold plated idols, creates an inviting, spiritual ambiance that makes a home feel peaceful and authentic.',
  'bc700000-0000-0000-0000-000000000001',
  '{"traditional decor","wall art","home decor"}',
  'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=800',
  6, true,
  'Traditional Indian Wall Decor Trends 2026 | Chandan Art Gallery',
  'Discover the hottest trends in Indian traditional home decor, merging hand-carvings with modern framing.'
)
on conflict (slug) do update set
  title = excluded.title,
  content = excluded.content,
  is_published = excluded.is_published;
