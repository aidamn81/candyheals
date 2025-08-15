// netlify/functions/oauth.js
export async function handler(event) {
  const siteURL = process.env.SITE_URL || `https://${event.headers.host}`;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const base = '/.netlify/functions/oauth';
  const redirectUri = `${siteURL}${base}/callback`;
  const scope = 'repo';
  const path = event.path || '';

  const redirect = (Location) => ({ statusCode: 302, headers: { Location }, body: '' });
  const html = (body) => ({ statusCode: 200, headers: {'Content-Type':'text/html'}, body });

  if (path.endsWith('/callback')) {
    const code = (event.queryStringParameters||{}).code;
    if (!code) return html('<p>Missing code</p>');
    const params = new URLSearchParams({
      client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri
    });
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type':'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await r.json();
    const token = data.access_token || '';
    return html(`<!doctype html><meta charset="utf-8"><script>
      (function(){
        if(window.opener){ window.opener.postMessage({ token: "${token}" }, "*"); window.close(); }
        else { document.body.textContent='Token received. You can close this tab.'; }
      })();
    </script>`);
  }

  const state = Math.random().toString(36).slice(2);
  const auth = new URL('https://github.com/login/oauth/authorize');
  auth.searchParams.set('client_id', clientId);
  auth.searchParams.set('scope', scope);
  auth.searchParams.set('redirect_uri', redirectUri);
  auth.searchParams.set('state', state);
  return redirect(auth.toString());
}
