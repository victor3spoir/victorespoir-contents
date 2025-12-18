# OAuth Proxy for Decap CMS

This directory contains the OAuth proxy setup for Decap CMS GitHub authentication.

## Why You Need This

Decap CMS cannot authenticate directly with GitHub from the browser for security reasons. An OAuth proxy is required to:
1. Handle the GitHub OAuth handshake securely
2. Exchange the authorization code for an access token
3. Return the token to the CMS client

## Quick Setup Options

### Option 1: Cloudflare Workers (Recommended - Free)

Deploy a lightweight OAuth proxy using Cloudflare Workers:

#### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

#### Step 2: Create Worker
```bash
cd oauth-proxy
wrangler deploy
```

#### Step 3: Set Secrets
```bash
wrangler secret put OAUTH_CLIENT_ID
# Paste your GitHub OAuth App Client ID

wrangler secret put OAUTH_CLIENT_SECRET
# Paste your GitHub OAuth App Client Secret
```

#### Step 4: Update CMS Config
In `admin/config.yml`:
```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://decap-cms-oauth.your-subdomain.workers.dev
```

### Option 2: Use an Existing OAuth Proxy Template

#### Cloudflare Worker Template
Use the community-maintained template:
```bash
git clone https://github.com/sterlingwes/decap-proxy
cd decap-proxy
# Follow setup instructions in the repository
```

#### Node.js Template
For deployment to Vercel, Heroku, or any Node.js hosting:
```bash
git clone https://github.com/saroj-shr/decap-cms-oauth
cd decap-cms-oauth
# Follow setup instructions in the repository
```

### Option 3: DecapBridge (Paid Service)

[DecapBridge](https://decapbridge.com/) provides instant authentication with:
- Email invites
- Google/Microsoft login
- No OAuth proxy deployment needed

This is ideal for clients or non-technical users who don't have GitHub accounts.

## GitHub OAuth App Setup

Before deploying any OAuth proxy, create a GitHub OAuth App:

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `Decap CMS OAuth - Victor Espoir`
   - **Homepage URL**: `https://victor3spoir.github.io/victorespoir-contents/`
   - **Authorization callback URL**: `https://your-worker-url.workers.dev/callback`
     (Replace with your actual Cloudflare Worker URL or OAuth proxy URL)
4. Save the **Client ID** and **Client Secret**

**Important**: The callback URL must match your OAuth proxy's `/callback` endpoint exactly.

## Security Notes

- **Never commit** your OAuth Client Secret to the repository
- Store secrets securely in your OAuth proxy environment (Cloudflare Worker secrets, environment variables, etc.)
- Use HTTPS for all endpoints
- Regularly rotate your OAuth secrets

## Troubleshooting

### 404 Error on Authentication
- Verify your OAuth proxy is deployed and accessible
- Check that the callback URL in your GitHub OAuth App matches your proxy URL
- Ensure `/auth` and `/callback` routes are working on your proxy

### Authentication Fails
- Check your OAuth Client ID and Secret are correct
- Verify the proxy has access to the secrets
- Check browser console for error messages

### Cannot Commit to Repository
- Ensure your GitHub account has write access to the repository
- Check that the OAuth app is authorized for the repository
- Verify there are no branch protection rules blocking commits

## Testing Your OAuth Proxy

After deployment, you can test if your OAuth proxy is working:

### 1. Basic Connectivity Test
Visit your worker URL in a browser:
```
https://your-worker-url.workers.dev/
```
You should see a "Not Found" message (this is normal - the root path returns 404).

### 2. Test Auth Endpoint
Visit:
```
https://your-worker-url.workers.dev/auth?provider=github
```
You should be redirected to GitHub's OAuth page (if secrets are configured).

### 3. Full Integration Test
1. Update `admin/config.yml` with your worker URL
2. Visit your CMS admin page
3. Click "Login with GitHub"
4. Should redirect through your worker to GitHub

## Deployment Tips

### Using npm Scripts
The `package.json` includes helpful scripts:

```bash
npm run deploy                    # Deploy to Cloudflare
npm run dev                       # Run locally for testing
npm run tail                      # View real-time logs
npm run secret:list               # List configured secrets
npm run secret:put-client-id      # Add Client ID
npm run secret:put-client-secret  # Add Client Secret
```

### Updating Your Worker
To update after making changes:
```bash
wrangler deploy
```

### Viewing Logs
To see real-time logs of your worker:
```bash
wrangler tail
```

This is helpful for debugging authentication issues.

## Cost & Limits

**Cloudflare Workers Free Tier:**
- 100,000 requests per day
- 10ms CPU time per request
- More than enough for personal blogs and small teams

For higher traffic, Cloudflare Workers paid plans start at $5/month with 10 million requests.

## Learn More

- [Decap CMS GitHub Backend Docs](https://decapcms.org/docs/github-backend/)
- [External OAuth Clients](https://decapcms.org/docs/external-oauth-clients/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
