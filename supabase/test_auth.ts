import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
  const i = line.indexOf('=');
  return [line.slice(0, i), line.slice(i + 1)];
}));

async function run() {
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.log("Missing env vars");
    return;
  }
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  
  // Create a test user
  const email = 'test_resend_123@example.com';
  const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
  });
  if (createErr) {
    console.log("Create Error:", createErr.message);
    return;
  }
  const userId = newUser.user.id;
  console.log("Created user", userId);

  // Sign in with original password
  const { error: sign1Err } = await adminClient.auth.signInWithPassword({ email, password: 'password123' });
  console.log("Sign In 1 Error:", sign1Err?.message || "Success");

  // Update password
  const newPassword = 'newpassword456';
  const { error: updateErr } = await adminClient.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  console.log("Update Error:", updateErr?.message || "Success");

  // Sign in with new password
  const { error: sign2Err } = await adminClient.auth.signInWithPassword({ email, password: newPassword });
  console.log("Sign In 2 Error:", sign2Err?.message || "Success");

  // Cleanup
  await adminClient.auth.admin.deleteUser(userId);
  console.log("Deleted user");
}

run();
