document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('appointmentForm');
  if (!form) return;

  function buildRequestBody(data) {
    return [
      'New appointment request',
      '',
      'Name: ' + data.get('name'),
      'Email address: ' + data.get('email'),
      'Phone number: ' + (data.get('phone') || 'Not provided'),
      'Concern type: ' + data.get('concern'),
      'Preferred date: ' + (data.get('date') || 'Not specified'),
      'Preferred time: ' + (data.get('time') || 'Not specified'),
      'Consultation mode: ' + data.get('mode'),
      '',
      'Concern details:',
      data.get('message'),
      '',
      'This request is for initial coordination only and does not create an attorney-client relationship.'
    ].join('\n');
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var body = buildRequestBody(data);
    var status = document.getElementById('appointmentStatus');
    var messengerUrl = form.getAttribute('data-office-messenger');
    var officeEmail = form.getAttribute('data-office-email');
    var submitButton = form.querySelector('.form-submit');
    var previewWrap = document.getElementById('messagePreviewWrap');
    var preview = document.getElementById('messagePreview');
    preview.value = body;
    previewWrap.hidden = false;
    status.textContent = 'Sending your appointment request by email...';
    submitButton.disabled = true;
    try {
      var emailData = new FormData();
      emailData.append('name', data.get('name'));
      emailData.append('email', data.get('email'));
      emailData.append('phone', data.get('phone') || 'Not provided');
      emailData.append('concern', data.get('concern'));
      emailData.append('date', data.get('date') || 'Not specified');
      emailData.append('time', data.get('time') || 'Not specified');
      emailData.append('mode', data.get('mode'));
      emailData.append('message', data.get('message'));
      emailData.append('_subject', 'New appointment request - Garcia Law Office');
      emailData.append('_captcha', 'false');
      emailData.append('_template', 'table');
      var response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(officeEmail), { method: 'POST', body: emailData, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Email delivery failed');
      status.textContent = 'Your appointment request was sent by email. The office will reply to confirm availability.';
    } catch (error) {
      status.textContent = 'Email delivery is unavailable. Your message is ready for Messenger.';
      window.open(messengerUrl, '_blank', 'noopener');
      if (navigator.clipboard) navigator.clipboard.writeText(body).catch(function () {});
    } finally {
      submitButton.disabled = false;
    }
  });
});
