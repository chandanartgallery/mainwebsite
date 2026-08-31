const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugImages() {
  console.log('=== DEBUGGING PRODUCT IMAGES ===');
  
  // First, check if we can get products
  console.log('\n1. Checking products table...');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug')
    .limit(5);
    
  if (productsError) {
    console.error('Products error:', productsError);
    return;
  }
  
  console.log(`Found ${products.length} products:`, products.map(p => ({ id: p.id, name: p.name })));
  
  // Check if product_images table exists and has data
  console.log('\n2. Checking product_images table...');
  const { data: productImages, error: imagesError } = await supabase
    .from('product_images')
    .select('*')
    .limit(10);
    
  if (imagesError) {
    console.error('Product images error:', imagesError);
    return;
  }
  
  console.log(`Found ${productImages.length} product images:`, productImages);
  
  // Check a specific product with images
  if (products.length > 0) {
    console.log('\n3. Checking product with joined images...');
    const { data: productWithImages, error: joinError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        product_images(image_url, is_primary, display_order)
      `)
      .eq('id', products[0].id)
      .single();
      
    if (joinError) {
      console.error('Join error:', joinError);
      return;
    }
    
    console.log('Product with images:', JSON.stringify(productWithImages, null, 2));
  }
  
  // Check for new Gurbani products specifically
  console.log('\n4. Checking for Gurbani products...');
  const { data: gurbaniProducts, error: gurbaniError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      product_images(image_url, is_primary, display_order)
    `)
    .ilike('name', '%gurbani%');
    
  if (gurbaniError) {
    console.error('Gurbani products error:', gurbaniError);
    return;
  }
  
  console.log(`Found ${gurbaniProducts.length} Gurbani products:`, JSON.stringify(gurbaniProducts, null, 2));
}

debugImages().catch(console.error);