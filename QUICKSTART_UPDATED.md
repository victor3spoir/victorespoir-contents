# Quick Start - Decap CMS Authentication Fix

This is the **UPDATED** quick start guide after fixing the authentication issue.

## 🚨 What Changed?

**Old (Broken)**: Used `base_url: https://auth.decapcms.org` → **404 Error**

**New (Fixed)**: Deploy your own OAuth proxy → **Authentication Works!**

## 🚀 3-Step Setup

### Step 1: Deploy OAuth Proxy (5 minutes)

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare (free account)
wrangler login

# Deploy the worker
cd oauth-proxy
wrangler deploy
```

Save the URL shown (e.g., `https://decap-cms-oauth.your-subdomain.workers.dev`)

### Step 2: Create GitHub OAuth App (2 minutes)

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Name**: `Decap CMS OAuth`
   - **Homepage URL**: `https://victor3spoir.github.io/victorespoir-contents/`
   - **Callback URL**: `https://your-worker-url.workers.dev/callback` ← Use YOUR worker URL
4. Save **Client ID** and **Client Secret**

### Step 3: Configure Everything (3 minutes)

**Add secrets to Cloudflare Worker:**
```bash
cd oauth-proxy
wrangler secret put OAUTH_CLIENT_ID    # Paste your Client ID
wrangler secret put OAUTH_CLIENT_SECRET # Paste your Client Secret
```

**Update `admin/config.yml`:**
```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://your-worker-url.workers.dev  # YOUR worker URL here
```

## ✅ Test It

1. Visit: `https://victor3spoir.github.io/victorespoir-contents/admin/`
2. Click "Login with GitHub"
3. Should redirect to GitHub (NOT get a 404!)
4. Authorize the app
5. Start editing! 🎉

## 📚 More Help

- **Full documentation**: See [`AUTHENTICATION_FIX.md`](./AUTHENTICATION_FIX.md)
- **OAuth proxy details**: See [`oauth-proxy/README.md`](./oauth-proxy/README.md)
- **Step-by-step guide**: See [`SETUP.md`](./SETUP.md)

## 🐛 Still Having Issues?

### Getting 404?
→ OAuth proxy not deployed. Go back to Step 1.

### Authentication fails?
→ Check GitHub OAuth callback URL matches `https://your-worker-url.workers.dev/callback`

### Worker deployment fails?
→ Ensure you have a Cloudflare account and are logged in with `wrangler login`

---

**Questions?** See the detailed guides or open an issue.
