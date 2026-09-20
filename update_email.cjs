const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../frontend/.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabase
    .from('admin_credentials')
    .update({ email: 'urvoicevitap@gmail.com' })
    .eq('id', 1);

  if (error) {
    console.error('Error updating email:', error);
  } else {
    console.log('Successfully updated default admin email to urvoicevitap@gmail.com');
  }
}

main();
