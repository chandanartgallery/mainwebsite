const https = require('https');
const http = require('http');

async function testImageUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        url: url,
        status: res.statusCode,
        headers: {
          'content-type': res.headers['content-type'],
          'content-length': res.headers['content-length']
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url: url,
        error: err.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      resolve({
        url: url,
        error: 'Timeout'
      });
    });
    
    req.end();
  });
}

async function testImages() {
  console.log('=== TESTING IMAGE URLs ===');
  
  const testUrls = [
    // Old products (should work)
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/2/1.png',
    
    // Gurbani products from debug
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/19/1.png',
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/31/1.png',
    
    // Expected folders from user request (32-37, 38)
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/32/1.png',
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/37/1.png',
    'https://pykgahwdzqotbchvaviq.supabase.co/storage/v1/object/public/products/38/1.png'
  ];
  
  for (const url of testUrls) {
    console.log(`\nTesting: ${url}`);
    const result = await testImageUrl(url);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else if (result.status === 200) {
      console.log(`✅ Success: ${result.status} - ${result.headers['content-type']} (${result.headers['content-length']} bytes)`);
    } else {
      console.log(`⚠️  Status: ${result.status}`);
    }
  }
}

testImages().catch(console.error);