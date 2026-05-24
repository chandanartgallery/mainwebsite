const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1]] = val;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBuckets() {
  console.log('Setting up storage buckets...');
  
  // 1. Create product-images bucket
  const { data: pData, error: pError } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
  });
  if (pError) {
    console.log('product-images bucket exists or error:', pError.message);
  } else {
    console.log('product-images bucket created successfully:', pData);
  }

  // 2. Create profile-avatars bucket
  const { data: aData, error: aError } = await supabase.storage.createBucket('profile-avatars', {
    public: true,
    fileSizeLimit: 2097152, // 2MB
  });
  if (aError) {
    console.log('profile-avatars bucket exists or error:', aError.message);
  } else {
    console.log('profile-avatars bucket created successfully:', aData);
  }

  // Set up storage RLS policies if needed, but since service role creates it, and they are public: true, public reads are allowed.
  // Let's check policies on storage.objects.
  // Usually, to allow anyone to upload files to product-images / profile-avatars, we can add RLS policies.
  // Wait, let's write SQL queries to ensure public access for uploads/downloads just in case!
  console.log('Creating storage SQL policies...');
  
  const sql = `
    -- Enable public read on storage objects
    create policy "Public read product-images" on storage.objects for select using (bucket_id = 'product-images');
    create policy "Public insert product-images" on storage.objects for insert with check (bucket_id = 'product-images');
    
    create policy "Public read profile-avatars" on storage.objects for select using (bucket_id = 'profile-avatars');
    create policy "Public insert profile-avatars" on storage.objects for insert with check (bucket_id = 'profile-avatars');
    create policy "Public update profile-avatars" on storage.objects for update using (bucket_id = 'profile-avatars');
  `;
  
  // Storage policies can also be set via client-side uploads.
  // To allow simple uploads, we can use the service role client or set public insert policies on storage.objects.
  // Let's try running SQL to create storage policies.
  try {
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (rlsError) {
      // If exec_sql RPC doesn't exist, we can use direct SQL migration or we can run standard policy queries.
      console.log('RLS SQL policy setup warning (exec_sql RPC might not be defined):', rlsError.message);
    } else {
      console.log('RLS SQL policies applied successfully.');
    }
  } catch (err) {
    console.log('RLS SQL policy error:', err.message);
  }
}

setupBuckets();
