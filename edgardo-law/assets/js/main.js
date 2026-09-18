document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var responses = {
    start: 'Hi, I am GALA, the Garcia Law Office Legal Assistant. I can help you find general information and the right next step. I do not give legal advice or create an attorney-client relationship.',
    services: 'Garcia Law Office may assist with family, civil or property, criminal, and notarial concerns. Visit the Services page for the current practice areas.',
    consultation: 'For an initial consultation, share a short summary of your concern, your preferred schedule, and your contact details. You can use the appointment form on the Contact page.',
    documents: 'Bring a valid government ID and any documents directly related to your concern. Keep copies of originals, and do not send passwords or unnecessary sensitive information through chat.',
    urgent: 'If someone is in immediate danger or a crime is happening now, contact local emergency services first. For a legal concern, contact the office directly so the team can assess the next step.',
    disclaimer: 'GALA provides general educational information only. It cannot assess your case, predict an outcome, or replace advice from a qualified lawyer who has reviewed your facts.'
  };

  function addMessage(list, text, type) {
    var message = document.createElement('li');
    message.className = 'gala-message gala-message-' + type;
    message.textContent = text;
    list.appendChild(message);
    list.scrollTop = list.scrollHeight;
  }

  function getResponse(text) {
    var input = text.toLowerCase();
    if (/service|help with|practice|family|property|civil|criminal|notar/.test(input)) return responses.services;
    if (/consult|appointment|schedule|book|meet|lawyer/.test(input)) return responses.consultation;
    if (/document|bring|requirement|id|paper/.test(input)) return responses.documents;
    if (/urgent|emergency|arrest|danger|help now/.test(input)) return responses.urgent;
    if (/advice|case|guarantee|outcome|legal opinion/.test(input)) return responses.disclaimer;
    return 'I can help with services, consultations, documents to bring, or urgent next steps. You can also send your concern through the Contact page.';
  }

  async function askGala(text) {
    try {
      var response = await fetch('/.netlify/functions/gala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });
      if (!response.ok) throw new Error('GALA service unavailable');
      var data = await response.json();
      if (data.answer) return data.answer;
    } catch (error) {
      return getResponse(text);
    }
    return getResponse(text);
  }

  function initGalaChat() {
    if (document.getElementById('galaChat')) return;
    var wrapper = document.createElement('section');
    wrapper.id = 'galaChat';
    wrapper.className = 'gala-chat';
    wrapper.setAttribute('aria-label', 'GALA legal assistant');
    wrapper.innerHTML = '<button class="gala-launcher" type="button" aria-expanded="false" aria-controls="galaPanel"><span class="gala-launcher-mark" aria-hidden="true">G</span><span>Ask GALA</span></button>' +
      '<div class="gala-panel" id="galaPanel" hidden><div class="gala-panel-header"><div><strong>GALA</strong><small>Garcia Legal Assistant</small></div><button class="gala-close" type="button" aria-label="Close GALA">&times;</button></div>' +
      '<div class="gala-disclaimer">General information only. This chat does not provide legal advice.</div><ol class="gala-messages" aria-live="polite"></ol>' +
      '<div class="gala-quick-actions"><button type="button" data-gala-topic="services">Services</button><button type="button" data-gala-topic="consultation">Consultation</button><button type="button" data-gala-topic="documents">Documents</button></div>' +
      '<form class="gala-form"><label class="gala-sr-only" for="galaInput">Ask GALA a question</label><input id="galaInput" name="question" type="text" maxlength="240" autocomplete="off" placeholder="Type your question..." required><button type="submit" aria-label="Send question">Send</button></form>' +
      '<a class="gala-contact-link" href="/contact/">Continue to Contact</a></div>';
    document.body.appendChild(wrapper);
    var launcher = wrapper.querySelector('.gala-launcher');
    var panel = wrapper.querySelector('.gala-panel');
    var close = wrapper.querySelector('.gala-close');
    var messages = wrapper.querySelector('.gala-messages');
    var form = wrapper.querySelector('.gala-form');
    var input = wrapper.querySelector('#galaInput');
    function openPanel() {
      panel.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      if (!messages.children.length) addMessage(messages, responses.start, 'bot');
      input.focus();
    }
    function closePanel() {
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    }
    launcher.addEventListener('click', openPanel);
    close.addEventListener('click', closePanel);
    wrapper.querySelectorAll('[data-gala-topic]').forEach(function (button) {
      button.addEventListener('click', function () {
        addMessage(messages, button.textContent, 'user');
        addMessage(messages, responses[button.getAttribute('data-gala-topic')], 'bot');
      });
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var question = input.value.trim();
      if (!question) return;
      addMessage(messages, question, 'user');
      input.value = '';
      input.disabled = true;
      addMessage(messages, 'GALA is preparing an answer...', 'bot gala-message-loading');
      var loadingMessage = messages.lastElementChild;
      var answer = await askGala(question);
      loadingMessage.textContent = answer;
      loadingMessage.classList.remove('gala-message-loading');
      input.disabled = false;
      input.focus();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) closePanel();
    });
  }
  initGalaChat();
});
