document.addEventListener('DOMContentLoaded', async function () {
  var form = document.getElementById('clientLoginForm');
  var privateClient = document.querySelector('[data-private-client]');
  if ((!form && !privateClient) || !window.supabase) return;

  var status = document.getElementById(form ? 'loginStatus' : 'privateClientStatus');
  var submit = form ? form.querySelector('[type="submit"]') : null;
  var supabaseClient;

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  try {
    var configResponse = await fetch('/.netlify/functions/auth-config');
    var config = await configResponse.json();
    if (!config.supabaseUrl || !config.supabaseAnonKey) throw new Error('Auth is not configured');
    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

    var sessionResult = await supabaseClient.auth.getSession();
    if (privateClient && !sessionResult.data.session) {
      window.location.href = '/login/?returnTo=' + encodeURIComponent(window.location.pathname);
      return;
    }
    if (privateClient) {
      privateClient.classList.add('is-authenticated');
      setStatus('Signed in securely.');
    }
  } catch (error) {
    setStatus('Login is not configured yet. Please contact the office.', true);
    return;
  }

  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    submit.disabled = true;
    setStatus('Signing you in...');
    var data = new FormData(form);
    var result = await supabaseClient.auth.signInWithPassword({
      email: data.get('email'),
      password: data.get('password')
    });
    if (result.error) {
      setStatus(result.error.message, true);
      submit.disabled = false;
      return;
    }
    var returnTo = new URLSearchParams(window.location.search).get('returnTo');
    window.location.href = returnTo && returnTo.startsWith('/') ? returnTo : '/client/';
  });

  document.querySelectorAll('[data-auth-provider]').forEach(function (button) {
    button.addEventListener('click', async function () {
      button.disabled = true;
      setStatus('Connecting securely...');
      var result = await supabaseClient.auth.signInWithOAuth({
        provider: button.getAttribute('data-auth-provider'),
        options: { redirectTo: window.location.origin + '/login/' }
      });
      if (result.error) {
        setStatus(result.error.message, true);
        button.disabled = false;
      }
    });
  });
});
