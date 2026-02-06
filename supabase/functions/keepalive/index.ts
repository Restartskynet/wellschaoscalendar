// Keepalive Edge Function
// Simple health check that touches the DB lightly.
// Set up a free uptime monitor (e.g., UptimeRobot, Cron-Job.org) to ping this
// every 5-10 minutes to keep the Supabase project active on free tier.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Light DB touch — count profiles
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({ status: 'ok', profiles: count ?? 0, timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Keepalive error:', e);
    return new Response(
      JSON.stringify({ status: 'error', message: 'Health check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
