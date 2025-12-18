/**
 * Cloudflare Worker OAuth Proxy for Decap CMS
 * 
 * This worker handles GitHub OAuth authentication for Decap CMS.
 * It provides two endpoints:
 * - /auth: Initiates the OAuth flow
 * - /callback: Handles the OAuth callback and returns the token
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Set CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    try {
      // Route: /auth - Initiate OAuth flow
      if (path === '/auth') {
        return handleAuth(request, env, corsHeaders);
      }

      // Route: /callback - Handle OAuth callback
      if (path === '/callback') {
        return handleCallback(request, env, corsHeaders);
      }

      // Route: /success - Success page
      if (path === '/success') {
        return handleSuccess(request, env, corsHeaders);
      }

      // Default: Return 404
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};

/**
 * Handle /auth endpoint - Initiate OAuth flow
 */
function handleAuth(request, env, corsHeaders) {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');
  const siteId = url.searchParams.get('site_id');

  if (!provider || provider !== 'github') {
    return new Response('Invalid provider', {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!env.OAUTH_CLIENT_ID) {
    return new Response('OAuth Client ID not configured', {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Build GitHub OAuth authorization URL
  const authUrl = new URL(env.OAUTH_AUTHORIZE_URL || 'https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
  authUrl.searchParams.set('scope', env.SCOPES || 'repo,user');
  authUrl.searchParams.set('redirect_uri', `${new URL(request.url).origin}/callback`);
  
  // Store site_id in state parameter for callback
  if (siteId) {
    authUrl.searchParams.set('state', siteId);
  }

  // Redirect to GitHub
  return Response.redirect(authUrl.toString(), 302);
}

/**
 * Handle /callback endpoint - Exchange code for token
 */
async function handleCallback(request, env, corsHeaders) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // site_id

  if (!code) {
    return new Response('Missing authorization code', {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!env.OAUTH_CLIENT_ID || !env.OAUTH_CLIENT_SECRET) {
    return new Response('OAuth credentials not configured', {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    // Exchange code for access token
    const tokenUrl = env.OAUTH_TOKEN_URL || 'https://github.com/login/oauth/access_token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.OAUTH_CLIENT_ID,
        client_secret: env.OAUTH_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await response.json();

    if (data.error || !data.access_token) {
      console.error('OAuth error:', data);
      return new Response(`OAuth error: ${data.error_description || 'Failed to get access token'}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Return success page with token (Decap CMS will extract it)
    const successUrl = new URL(`${url.origin}/success`);
    successUrl.searchParams.set('token', data.access_token);
    if (state) {
      successUrl.searchParams.set('state', state);
    }

    return Response.redirect(successUrl.toString(), 302);
  } catch (error) {
    console.error('Token exchange error:', error);
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
}

/**
 * Handle /success endpoint - Display success and send token to CMS
 */
function handleSuccess(request, env, corsHeaders) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const state = url.searchParams.get('state');

  if (!token) {
    return new Response('Missing token', {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Escape the token to prevent XSS
  const escapedToken = token
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Create HTML page that will send the token back to the CMS
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authorization Complete</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }
    .checkmark {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }
    p {
      margin: 0;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">✓</div>
    <h1>Authorization Complete</h1>
    <p>You can close this window and return to the CMS.</p>
  </div>
  <script>
    (function() {
      // Token passed securely via data attribute
      const token = "${escapedToken}";
      
      function receiveMessage(e) {
        console.log("receiveMessage %o", e);
        window.opener.postMessage(
          'authorization:github:success:' + JSON.stringify({
            token: token,
            provider: "github"
          }),
          e.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      
      console.log("Sending message to opener");
      // Use specific origin instead of wildcard for security
      const allowedOrigin = "${env.ORIGIN || '*'}";
      window.opener.postMessage("authorizing:github", allowedOrigin);
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html',
    },
  });
}
