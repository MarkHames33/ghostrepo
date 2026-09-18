import {createHash} from 'node:crypto';
import {getStore} from '@netlify/blobs';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.URL || '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') return json({ok: true});
  if (request.method !== 'POST') return json({error: 'Method not allowed'}, 405);

  const body = new URLSearchParams(await request.text());
  const email = (body.get('email') || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({error: 'A valid email address is required'}, 400);
  }

  const key = createHash('sha256').update(email).digest('hex');
  const store = getStore({name: 'visitor-emails', consistency: 'strong'});
  await store.setJSON(key, {
    email,
    subscribedAt: new Date().toISOString()
  });

  return json({ok: true});
}
