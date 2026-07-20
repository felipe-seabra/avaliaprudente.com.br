const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableOrColumns(tableName, selectQuery) {
  const { data, error } = await supabase
    .from(tableName)
    .select(selectQuery)
    .limit(1);

  if (error) {
    return { exists: false, error: error.message, code: error.code };
  }
  return { exists: true };
}

async function checkRPC(rpcName, params = {}) {
  const { data, error } = await supabase
    .rpc(rpcName, params);

  if (error) {
    if (error.message.includes('Could not find the function') || error.code === 'PGRST202') {
      return { exists: false, error: error.message, code: error.code };
    }
    // Any other error means the function exists but maybe we passed wrong params or it threw an error
    return { exists: true, error: error.message, code: error.code };
  }
  return { exists: true };
}

async function main() {
  console.log('\n--- VERIFYING TABLES AND COLUMNS ON REMOTE DATABASE ---');
  
  // 1. Verify businesses.is_verified, verified_at, verified_by
  const businessesColumns = await checkTableOrColumns('businesses', 'is_verified, verified_at, verified_by');
  console.log('businesses columns (is_verified, verified_at, verified_by):', businessesColumns);

  // 2. Verify verification_requests table
  const verificationRequestsTable = await checkTableOrColumns('verification_requests', '*');
  console.log('verification_requests table:', verificationRequestsTable);

  // 3. Verify notifications table
  const notificationsTable = await checkTableOrColumns('notifications', '*');
  console.log('notifications table:', notificationsTable);

  // 4. Verify RPC functions existence
  console.log('\n--- VERIFYING RPC FUNCTIONS ON REMOTE DATABASE ---');
  
  const isAdminFunc = await checkRPC('is_admin', { user_id: '00000000-0000-0000-0000-000000000000' });
  console.log('is_admin function:', isAdminFunc);

  const isSuspendedFunc = await checkRPC('is_suspended', { u_id: '00000000-0000-0000-0000-000000000000' });
  console.log('is_suspended function:', isSuspendedFunc);

  const isBusinessFrozenFunc = await checkRPC('is_business_frozen', { b_id: '00000000-0000-0000-0000-000000000000' });
  console.log('is_business_frozen function:', isBusinessFrozenFunc);
}

main();
