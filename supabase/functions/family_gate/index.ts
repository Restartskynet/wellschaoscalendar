// Family Gate Edge Function
// Validates the family access code and issues a device token.
// This is the FIRST gate: users must pass this before they can attempt login.
// Once per device — the device token is stored locally.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { familyCode, deviceId } = await req.json();

    if (!familyCode || !deviceId) {
      return new Response(
        JSON.stringify({ error: 'Missing familyCode or deviceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate family code against hashed secret
    // The FAMILY_CODE_HASH is stored as a Supabase secret (set via Dashboard or CLI)
    // For simplicity, we compare the raw code against the secret.
    // In production, use a proper hash comparison.
    const expectedCode = Deno.env.get('FAMILY_ACCESS_CODE');
    if (!expectedCode) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (familyCode !== expectedCode) {
      return new Response(
        JSON.stringify({ error: 'Invalid family code' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a device token
    const deviceToken = crypto.randomUUID();

    // Store in database using service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Upsert device gate (if device already registered, update token)
    const { error: dbError } = await supabase
      .from('device_gates')
      .upsert(
        { device_id: deviceId, device_token: deviceToken, last_used_at: new Date().toISOString() },
        { onConflict: 'device_id' }
      );

    if (dbError) {
      console.error('DB error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to register device' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ deviceToken }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Unexpected error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
