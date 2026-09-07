const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqakhwqvvwxjutttsaxf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWtod3F2dnd4anV0dHRzYXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTI5MzIsImV4cCI6MjEwNDI2ODkzMn0.Px-ReU_rvBCF7eJZcRJFfhrcja4VpEWejmubaCYPkO8';

async function updatePoints() {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: auth, error: aErr } = await sb.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'admin'
  });
  if (aErr) {
    console.error('Admin login error:', aErr.message);
    return;
  }

  const { data, error: uErr } = await sb
    .from('users')
    .update({ total_points: 9 })
    .eq('id', '56cac67a-ebbb-42ce-b50c-ef9d789eef7b')
    .select();

  console.log('Update result:', data, uErr);
}

updatePoints();
