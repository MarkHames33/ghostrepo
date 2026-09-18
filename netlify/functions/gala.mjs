const allowedOrigin = process.env.URL || '*';

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

function answerQuestion(question) {
  const input = question.toLowerCase();
  const filipino = /\b(ano|paano|saan|magkano|may|mga|kailangan|pwede|puwede|kayo|ako|ko|dapat|gusto|tulong|tanong)\b/.test(input);
  const taglish = filipino && /\b(consultation|appointment|documents|services|legal|office|schedule|property|family|criminal|notarial)\b/.test(input);
  const contact = taglish ? 'Para sa confirmed details o case-specific advice, pumunta sa Contact page.' : filipino ? 'Para sa kumpirmadong detalye o payo tungkol sa iyong partikular na kaso, pumunta sa Contact page.' : 'For confirmed details or case-specific advice, please use the Contact page.';

  if (/service|practice|tulong|help|family|property|civil|criminal|notar/.test(input)) return taglish ? 'Garcia Law Office may assist with family law, civil or property matters, criminal matters, and notarial services. ' + contact : filipino ? 'Maaaring tumulong ang Garcia Law Office sa family law, civil o property matters, criminal matters, at notarial services. ' + contact : 'Garcia Law Office may assist with family law, civil or property matters, criminal matters, and notarial services. ' + contact;
  if (/document|requirements|requirement|bring|dala|dalhin|kailangan/.test(input)) return taglish ? 'For your consultation, magdala ng valid government ID at documents na directly related sa concern mo. Itago ang originals at magdala ng copies kung maaari. Huwag magpadala ng passwords o unnecessary sensitive information sa chat.' : filipino ? 'Magdala ng valid government ID at mga dokumentong direktang may kinalaman sa concern mo. Itago ang originals at magdala ng kopya kung maaari. Huwag magpadala ng password o hindi kailangang sensitibong impormasyon sa chat.' : 'For a consultation, bring a valid government ID and documents directly related to your concern. Keep the originals and bring copies when possible. Do not send passwords or unnecessary sensitive information in chat.';
  if (/consult|appointment|schedule|book|meet|pakita|pumunta|iskedyul/.test(input)) return taglish ? 'You can request an initial consultation through the Contact page. Share a short summary of your concern, preferred schedule, and contact details. An appointment request does not create an attorney-client relationship.' : filipino ? 'Maaari kang humingi ng initial consultation sa Contact page. Ibahagi ang maikling buod ng concern, preferred schedule, at contact details. Ang appointment request ay hindi agad lumilikha ng attorney-client relationship.' : 'You can request an initial consultation through the Contact page. Share a short summary of your concern, preferred schedule, and contact details. An appointment request does not create an attorney-client relationship.';
  if (/where|location|address|saan|lokasyon|nasaan/.test(input)) return filipino ? 'Ang Garcia Law Office and Notary Public ay nasa Poblacion, Puerto Galera, Oriental Mindoro, 5203, beside Imperial Appliance Plaza. Gamitin ang Contact page para sa directions at updated office details.' : 'Garcia Law Office and Notary Public is in Poblacion, Puerto Galera, Oriental Mindoro, 5203, beside Imperial Appliance Plaza. Use the Contact page for directions and updated office details.';
  if (/urgent|emergency|danger|arrest|agarang|panganib/.test(input)) return filipino ? 'Kung may agarang panganib o krimen na nangyayari, tumawag muna sa local emergency services. Para sa legal concern, makipag-ugnayan sa office para matukoy ang susunod na hakbang.' : 'If there is immediate danger or a crime is happening now, contact local emergency services first. For a legal concern, contact the office to discuss the next step.';
  if (/fee|fees|cost|price|magkano|bayad|presyo/.test(input)) return filipino ? 'Hindi ko makumpirma ang kasalukuyang consultation o service fees. Makipag-ugnayan sa office sa Contact page para sa updated rates.' : 'I cannot confirm current consultation or service fees. Please use the Contact page to ask the office for updated rates.';
  if (/advice|legal opinion|case outcome|result|payo|kaso|mananalo/.test(input)) return filipino ? 'Makakapagbigay lamang ako ng general educational information, hindi legal advice o prediction ng resulta. Para sa partikular na kaso, magpa-consult sa qualified lawyer.' : 'I can provide general educational information, not legal advice or predictions about a case outcome. Please consult a qualified lawyer for your specific situation.';
  return filipino ? 'Makakatulong ako sa general FAQs tungkol sa services, consultation, documents, notarial services, at office location. Para sa ibang tanong, gamitin ang Contact page para makausap ang office.' : 'I can help with general FAQs about services, consultations, documents, notarial services, and the office location. For other questions, use the Contact page to reach the office.';
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question || question.length > 240) return json({ error: 'Question must be 1-240 characters' }, 400);

  return json({ answer: answerQuestion(question) });
}
