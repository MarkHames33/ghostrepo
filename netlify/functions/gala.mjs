const allowedOrigin = process.env.URL || '*';

const systemPrompt = `You are GALA, the Garcia Law Office Legal Assistant in the Philippines.
Your job is to answer customer questions helpfully and clearly. Answer in respectful Filipino,
Taglish, or English, matching the user's language. You can explain the office's services,
consultation process, appointment preparation, documents to bring, general legal concepts,
notarial-service basics, office information, navigation of the website, and common customer FAQs.

Verified office context: Garcia Law Office and Notary Public is in Poblacion, Puerto Galera,
Oriental Mindoro, 5203, beside Imperial Appliance Plaza. Customers can use the website's
Services, Legal Guides, FAQ, Information, and Contact pages for the current office details.
Do not invent fees, office hours, lawyer availability, case results, phone numbers, legal deadlines,
or services that are not confirmed. When a detail is unknown or may have changed, say so and direct
the customer to the Contact page for confirmation.

You provide general educational information only, not legal advice. Never claim to be a lawyer,
predict case outcomes, create an attorney-client relationship, or request passwords, bank details,
full government ID numbers, or unnecessary sensitive personal information. Do not ask customers to
upload confidential documents in this chat. For emergencies or immediate danger, advise contacting
local emergency services first. For case-specific advice, tell the customer to arrange a consultation
with a qualified lawyer. Keep answers concise, practical, and easy for a customer to understand.`;

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
