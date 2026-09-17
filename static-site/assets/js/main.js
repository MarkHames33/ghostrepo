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

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var body = buildRequestBody(data);
    var status = document.getElementById('appointmentStatus');
    var messengerUrl = form.getAttribute('data-office-messenger');
    var previewWrap = document.getElementById('messagePreviewWrap');
    var preview = document.getElementById('messagePreview');
    preview.value = body;
    previewWrap.hidden = false;
    preview.focus();
    preview.select();
    status.textContent = 'Your message is ready. Press Ctrl+C, then paste it into Messenger.';
    window.open(messengerUrl, '_blank', 'noopener');
    if (navigator.clipboard) navigator.clipboard.writeText(body).catch(function () {});
  });
});
