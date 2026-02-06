// Family Login Edge Function
// The ONLY login path the UI uses. Enforces:
// 1. Valid device token (gate must be passed)
// 2. Username allowlist
// 3. Rate limiting + lockout (per-username + per-IP)
// 4. Supabase Auth password grant via pseudo-email mapping

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit constants
const MAX_USERNAME_ATTEMPTS = 5;
const USERNAME_LOCKOUT_MINUTES = 20;
const MAX_IP_ATTEMPTS = 30;
const IP_WINDOW_MINUTES = 10;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { username, password, deviceId, deviceToken } = await req.json();

    if (!username || !password || !deviceId || !deviceToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP (best effort from headers)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    // 1. Validate device token
    const { data: gate } = await supabase
      .from('device_gates')
      .select('device_token')
      .eq('device_id', deviceId)
      .single();

    if (!gate || gate.device_token !== deviceToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid device token. Please enter the family access code first.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_used_at
    await supabase
      .from('device_gates')
      .update({ last_used_at: new Date().toISOString() })
      .eq('device_id', deviceId);

    // 2. Check username allowlist
    const { data: allowed } = await supabase
      .from('allowed_usernames')
      .select('username')
      .eq('username', username)
      .single();

    if (!allowed) {
      // Don't reveal that the username doesn't exist
      return new Response(
        JSON.stringify({ error: 'Invalid username or password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check rate limiting — per-username lockout
    const { data: lockout } = await supabase
      .from('username_lockouts')
      .select('*')
      .eq('username', username)
      .single();

    if (lockout && new Date(lockout.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(lockout.locked_until).getTime() - Date.now()) / 60000
      );
      return new Response(
        JSON.stringify({ error: `Account temporarily locked. Try again in ${minutesLeft} minutes.` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3b. Check per-IP rate limit
    const ipWindowStart = new Date(Date.now() - IP_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count: ipAttempts } = await supabase
      .from('auth_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('attempted_at', ipWindowStart);

    if ((ipAttempts ?? 0) >= MAX_IP_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts from this location. Please wait and try again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Attempt Supabase Auth login with pseudo-email
    const email = `${username}@wellschaos.family`;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Record attempt
    await supabase.from('auth_attempts').insert({
      username,
      ip_address: ip,
      success: !authError,
    });

    if (authError) {
      // Update lockout counter
      const currentCount = (lockout?.attempt_count ?? 0) + 1;
      const shouldLock = currentCount >= MAX_USERNAME_ATTEMPTS;

      await supabase
        .from('username_lockouts')
        .upsert({
          username,
          attempt_count: shouldLock ? 0 : currentCount,
          locked_until: shouldLock
            ? new Date(Date.now() + USERNAME_LOCKOUT_MINUTES * 60 * 1000).toISOString()
            : lockout?.locked_until ?? new Date(0).toISOString(),
          last_attempt_at: new Date().toISOString(),
        }, { onConflict: 'username' });

      if (shouldLock) {
        return new Response(
          JSON.stringify({ error: `Too many failed attempts. Account locked for ${USERNAME_LOCKOUT_MINUTES} minutes.` }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Invalid username or password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success — reset lockout counter
    await supabase
      .from('username_lockouts')
      .upsert({
        username,
        attempt_count: 0,
        locked_until: new Date(0).toISOString(),
        last_attempt_at: new Date().toISOString(),
      }, { onConflict: 'username' });

    // Return session tokens
    return new Response(
      JSON.stringify({
        access_token: authData.session!.access_token,
        refresh_token: authData.session!.refresh_token,
        expires_in: authData.session!.expires_in,
        user: {
          id: authData.user!.id,
          email: authData.user!.email,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Login error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
