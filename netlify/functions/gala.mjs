const allowedOrigin = process.env.URL || '*';

const systemPrompt = `You are GALA, the Garcia Law Office Legal Assistant in the Philippines.
Answer in clear, respectful Filipino or English, matching the user's language.
You provide general educational information only, not legal advice. Never claim to be a lawyer,
predict case outcomes, create an attorney-client relationship, or request passwords, bank details,
or unnecessary sensitive personal information. For emergencies, advise contacting local emergency
services. Encourage the user to consult Garcia Law Office for advice based on their complete facts.
Keep answers concise and practical. Mention the site's Contact page when an office consultation is the appropriate next step.`;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!process.env.OPENAI_API_KEY) return json({ error: 'GALA is not configured yet' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question || question.length > 240) return json({ error: 'Question must be 1-240 characters' }, 400);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ]
      })
    });

    if (!response.ok) return json({ error: 'Unable to reach GALA' }, 502);
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) return json({ error: 'GALA returned no answer' }, 502);
    return json({ answer });
  } catch {
    return json({ error: 'GALA is temporarily unavailable' }, 502);
  }
}
