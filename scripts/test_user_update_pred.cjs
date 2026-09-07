const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqakhwqvvwxjutttsaxf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWtod3F2dnd4anV0dHRzYXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTI5MzIsImV4cCI6MjEwNDI2ODkzMn0.Px-ReU_rvBCF7eJZcRJFfhrcja4VpEWejmubaCYPkO8';

async function testUserUpdatePred() {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: auth, error: aErr } = await sb.auth.signInWithPassword({
    email: 'test@gmail.com',
    password: 'test'
  });
  if (aErr) {
    console.error('Test user login error:', aErr.message);
    return;
  }

  const { data, error } = await sb
    .from('predictions')
    .update({ points_earned: 4 })
    .eq('id', '6beb6bd9-556e-4e98-b3fc-435c9323b081')
    .select();

  console.log('Update result as test user:', data, error);
}

testUserUpdatePred();
