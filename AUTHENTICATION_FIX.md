# Authentication Fix - Resolving 404 Errors

## Problem

You're experiencing a **404 error** when trying to authenticate with Decap CMS:

```
auth.decapcms.org/auth?provider=github&site_id=victor3spoir.github.io&scope=repo
```

## Root Cause

**`auth.decapcms.org` does not exist as a public OAuth proxy service.** This was a misconception in the original documentation.

Decap CMS (formerly Netlify CMS) requires an OAuth proxy to authenticate with GitHub for security reasons. However, there is no official public shared OAuth proxy - users must deploy their own.

## Solution

You need to **deploy your own OAuth proxy** and configure Decap CMS to use it.

### Quick Fix (3 Steps)

#### Step 1: Deploy an OAuth Proxy

We provide a ready-to-use Cloudflare Worker OAuth proxy in the `/oauth-proxy` directory.

**Deploy using Cloudflare Workers (Free Tier)**:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
cd oauth-proxy
wrangler deploy
```

This will give you a URL like: `https://decap-cms-oauth.your-subdomain.workers.dev`

**Set your secrets**:

```bash
# Set your GitHub OAuth App Client ID
wrangler secret put OAUTH_CLIENT_ID
# Paste your Client ID when prompted

# Set your GitHub OAuth App Client Secret
wrangler secret put OAUTH_CLIENT_SECRET
# Paste your Client Secret when prompted
```

#### Step 2: Create/Update GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App" (or edit existing one)
3. Set:
   - **Application name**: `Decap CMS OAuth - Victor Espoir`
   - **Homepage URL**: `https://victor3spoir.github.io/victorespoir-contents/`
   - **Authorization callback URL**: `https://your-worker-url.workers.dev/callback`
     (Replace with YOUR actual Cloudflare Worker URL)

#### Step 3: Update CMS Configuration

Edit `admin/config.yml` and add your OAuth proxy URL:

```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://your-worker-url.workers.dev  # Your Cloudflare Worker URL
```

**Important**: Replace `your-worker-url.workers.dev` with your actual deployed worker URL.

### Test Your Setup

1. Visit: `https://victor3spoir.github.io/victorespoir-contents/admin/`
2. Click "Login with GitHub"
3. You should be redirected to GitHub (not get a 404!)
4. Authorize the app
5. You'll be redirected back to the CMS, authenticated

## Alternative Solutions

### Option 1: Use a Community OAuth Proxy Template

If you don't want to use our Cloudflare Worker, use one of these community templates:

- **[decap-proxy](https://github.com/sterlingwes/decap-proxy)** - Cloudflare Worker template
- **[decap-cms-oauth](https://github.com/saroj-shr/decap-cms-oauth)** - Node.js for Vercel/Heroku
- **[decap-cms-github-backend](https://github.com/njfamirm/decap-cms-github-backend)** - TypeScript OAuth service

### Option 2: Use DecapBridge (Paid Service)

[DecapBridge](https://decapbridge.com/) provides instant authentication without deploying your own proxy:

- Supports email, Google, and Microsoft login
- No OAuth proxy deployment needed
- Ideal for non-technical users or clients
- Paid service with different tiers

## Why This Happened

The original documentation incorrectly suggested that `auth.decapcms.org` was a working public OAuth proxy service. This was a misunderstanding of how Decap CMS authentication works.

**The truth**:
- Decap CMS does NOT provide a public shared OAuth proxy
- Each user/organization must deploy their own OAuth proxy
- This is for security, customization, and reliability reasons

## Additional Resources

- [`/oauth-proxy/README.md`](./oauth-proxy/README.md) - Detailed OAuth proxy setup
- [`/admin/README.md`](./admin/README.md) - Complete Decap CMS configuration guide
- [Decap CMS External OAuth Clients](https://decapcms.org/docs/external-oauth-clients/) - Official docs
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/) - Worker platform docs

## Troubleshooting

### Still getting 404?
- Verify your Cloudflare Worker is deployed: visit `https://your-worker-url.workers.dev/` in a browser
- Check that `base_url` in `admin/config.yml` matches your worker URL exactly
- Ensure secrets are set in Cloudflare: `wrangler secret list`

### Authentication fails after OAuth?
- Check GitHub OAuth App callback URL matches `https://your-worker-url.workers.dev/callback`
- Verify your Client ID and Secret are correct in Cloudflare Worker secrets
- Check browser console for error messages

### Worker deployment fails?
- Ensure you're logged in: `wrangler login`
- Check you have a Cloudflare account
- Free tier supports 100,000 requests/day - more than enough for most use cases

## Summary

**The Fix**:
1. ❌ Remove: `base_url: https://auth.decapcms.org` (doesn't exist)
2. ✅ Deploy: Your own OAuth proxy using Cloudflare Workers
3. ✅ Configure: `base_url: https://your-worker-url.workers.dev`

**Result**: Authentication works! No more 404 errors.

---

**Questions?** See [`/oauth-proxy/README.md`](./oauth-proxy/README.md) for detailed troubleshooting.
