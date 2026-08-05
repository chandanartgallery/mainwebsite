-- Household product page copy for tray category
UPDATE public.products
SET product_config = jsonb_build_object(
  'tagline', 'Household Collection',
  'storyTitle', 'Details & Craft Notes',
  'sectionLabels', jsonb_build_object(
    'dimensions', 'Select Size',
    'materials', 'Select Material',
    'colors', 'Select Color Finish'
  ),
  'trustBadges', jsonb_build_array(
    jsonb_build_object('icon', 'truck', 'title', 'Free Delivery', 'subtitle', 'Across India'),
    jsonb_build_object('icon', 'shield', 'title', 'Secure Packing', 'subtitle', 'Transit Protection'),
    jsonb_build_object('icon', 'authentic', 'title', 'Studio Finished', 'subtitle', 'Hand-checked Quality')
  )
)
WHERE category_id = 'c1000000-0000-0000-0000-000000000008';
