const allowedOrigin = process.env.URL || '*';

export default async function handler() {
  return new Response(JSON.stringify({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Cache-Control': 'no-store'
    }
  });
}
