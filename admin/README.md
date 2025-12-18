# Decap CMS GitHub Authentication Setup

This directory contains the configuration for Decap CMS (formerly Netlify CMS) to work **exclusively with GitHub authentication** - no Netlify services required.

## 🎯 What's Configured

- **Backend**: GitHub (direct commits to repository)
- **Authentication**: GitHub OAuth via Decap's official OAuth proxy
- **No Netlify Dependencies**: Uses `https://auth.decapcms.org` instead of Netlify's auth service
- **Direct GitHub Integration**: All content changes commit directly to this repository

## 📁 Files

- **`config.yml`**: Main Decap CMS configuration
- **`index.html`**: Admin interface entry point

## 🔧 Setup Instructions

### Step 1: Deploy an OAuth Proxy

⚠️ **CRITICAL**: You must deploy your own OAuth proxy before authentication will work. There is no public shared OAuth proxy service available.

**Option A: Cloudflare Workers (Recommended - Free)**
1. See [`/oauth-proxy/README.md`](../oauth-proxy/README.md) for complete instructions
2. Quick start:
   ```bash
   cd oauth-proxy
   npm install -g wrangler
   wrangler login
   wrangler deploy
   ```
3. Set your GitHub OAuth credentials as secrets
4. Note your worker URL (e.g., `https://decap-cms-oauth.your-subdomain.workers.dev`)

**Option B: Community OAuth Templates**
- [decap-proxy (Cloudflare Worker)](https://github.com/sterlingwes/decap-proxy)
- [decap-cms-oauth (Node.js)](https://github.com/saroj-shr/decap-cms-oauth)
- [decap-cms-github-backend](https://github.com/njfamirm/decap-cms-github-backend)

**Option C: DecapBridge (Paid Service)**
- [DecapBridge](https://decapbridge.com/) provides instant authentication
- No deployment needed, supports email/Google/Microsoft login
- Ideal for non-technical users

### Step 2: Create a GitHub OAuth App

1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
   - Or visit: https://github.com/settings/developers

2. Fill in the application details:
   - **Application name**: `Decap CMS for Victor Espoir`
   - **Homepage URL**: `https://victor3spoir.github.io/victorespoir-contents/`
   - **Authorization callback URL**: `https://your-oauth-proxy-url/callback`
     - ⚠️ **CRITICAL**: Use YOUR deployed OAuth proxy URL + `/callback`
     - Example: `https://decap-cms-oauth.your-subdomain.workers.dev/callback`
     - This is NOT your site URL

3. Click **Register application**

4. You'll receive:
   - **Client ID**: A public identifier
   - **Client Secret**: Generate and securely store this (never commit to repo)

### Step 3: Configure Your OAuth Proxy

Add your GitHub OAuth credentials to your deployed OAuth proxy:
- For Cloudflare Workers: Use `wrangler secret put` commands
- For other platforms: Set environment variables
- See your OAuth proxy's documentation for specific instructions

### Step 4: Update CMS Configuration

Edit `admin/config.yml` and set your OAuth proxy URL:

```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://your-oauth-proxy-url  # Your Cloudflare Worker URL
```

### Step 5: Access the CMS

Once configured, access the CMS at:
```
https://victor3spoir.github.io/victorespoir-contents/admin/
```

The CMS will:
1. Redirect you to your OAuth proxy
2. OAuth proxy redirects to GitHub for authentication
3. Request permission to access your repository
4. Redirect back to your CMS admin interface
5. Allow you to create/edit content that commits directly to GitHub

## 🔍 Why Does Authentication Return 404?

### The Problem

If you see a 404 error at `auth.decapcms.org`, it's because **there is no public shared OAuth proxy service at this URL**. This is a common misconception in the Decap CMS community.

### Historical Context

**Decap CMS** (formerly Netlify CMS) requires an OAuth proxy to authenticate with GitHub. However:

1. **No Public Proxy**: There is no official public OAuth proxy service
2. **Netlify Identity**: Netlify provides OAuth for their hosted sites, but only for sites using their services
3. **Self-Hosting Required**: Users must deploy their own OAuth proxy or use a third-party service

### The Solution: Deploy Your Own OAuth Proxy

You must deploy your own OAuth proxy and configure it in your `config.yml`:

```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://your-oauth-proxy-url  # YOUR deployed OAuth proxy
```

**Without a deployed OAuth proxy**: Authentication will fail with 404 or other errors.

**With a properly deployed OAuth proxy**: Authentication works smoothly through your own secure infrastructure.

## ⚠️ Common Authentication Mistakes

### 1. Not Deploying an OAuth Proxy

**❌ WRONG:**
Assuming `auth.decapcms.org` is a working public service

**✅ CORRECT:**
Deploy your own OAuth proxy using Cloudflare Workers, Vercel, or another platform

### 2. Wrong Callback URL

**❌ WRONG:**
```
https://victor3spoir.github.io/victorespoir-contents/admin/callback
```

**✅ CORRECT:**
```
https://your-oauth-proxy-url.workers.dev/callback
```

The callback URL must point to YOUR OAuth proxy server, NOT your website. The proxy handles the OAuth flow and then redirects to your site.

### 3. Using `git-gateway` Backend

**❌ WRONG:**
```yaml
backend:
  name: git-gateway  # This requires Netlify Identity
```

**✅ CORRECT:**
```yaml
backend:
  name: github       # Direct GitHub integration
```

Git Gateway is a Netlify-specific service. For GitHub-only authentication, use the `github` backend.

### 4. Missing `base_url`

**❌ WRONG:**
```yaml
backend:
  name: github
  repo: owner/repo
  # Missing base_url - may default to Netlify
```

**✅ CORRECT:**
```yaml
backend:
  name: github
  repo: owner/repo
  base_url: https://auth.decapcms.org
```

### 5. Incorrect Repository Format

**❌ WRONG:**
```yaml
repo: https://github.com/owner/repo
repo: github.com/owner/repo
```

**✅ CORRECT:**
```yaml
repo: owner/repo
```

Use only the `owner/repo` format, not the full URL.

### 6. Branch Name Mismatch

Ensure the branch in `config.yml` matches your actual default branch:

```yaml
branch: main  # or 'master' if that's your default branch
```

### 7. CORS Issues

If hosting on a custom domain, ensure your OAuth proxy allows requests from your domain. The Decap proxy should handle this automatically for GitHub Pages.

### 8. Missing Repository Permissions

The GitHub OAuth App needs permission to access your repository. When you first authenticate, GitHub will ask you to authorize the app. Make sure you:
- Grant access to the specific repository
- If it's an organization repo, ensure the organization allows OAuth Apps

## 🔐 Security Notes

1. **Never commit the Client Secret**: The OAuth Client Secret should be stored securely in your OAuth proxy server, never in your repository
2. **Public Repositories**: This setup works with public repositories. For private repos, ensure proper access permissions
3. **OAuth Scope**: The GitHub backend requires `repo` scope for full access to commit to your repository

## 📝 How It Works

```
┌─────────────┐
│   Browser   │
│  (Your CMS) │
└──────┬──────┘
       │ 1. User clicks "Login with GitHub"
       ▼
┌─────────────────────┐
│   Decap CMS JS      │
│  (decap-cms.js)     │
└──────┬──────────────┘
       │ 2. Redirect to your OAuth proxy
       ▼
┌─────────────────────┐
│  Your OAuth Proxy   │
│ (Cloudflare Worker) │
└──────┬──────────────┘
       │ 3. Redirect to GitHub OAuth
       ▼
┌─────────────────────┐
│   GitHub OAuth      │
│  github.com/login   │
└──────┬──────────────┘
       │ 4. User authorizes
       ▼
┌─────────────────────┐
│  Your OAuth Proxy   │
│ (exchanges code for │
│  access token)      │
└──────┬──────────────┘
       │ 5. Redirect back to your CMS with token
       ▼
┌─────────────────────┐
│   Your CMS Admin    │
│  (authenticated!)   │
└─────────────────────┘
       │ 6. Make edits, commit to GitHub
       ▼
┌─────────────────────┐
│  GitHub Repository  │
│  (commits saved)    │
└─────────────────────┘
```

## 🚀 Deployment

This repository is configured to deploy to GitHub Pages via GitHub Actions. The admin interface will be available at:

```
https://[username].github.io/[repo-name]/admin/
```

For this repository:
```
https://victor3spoir.github.io/victorespoir-contents/admin/
```

## 📚 Additional Resources

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [GitHub Backend Configuration](https://decapcms.org/docs/github-backend/)
- [External OAuth Clients](https://decapcms.org/docs/external-oauth-clients/)
- [Decap CMS GitHub Repository](https://github.com/decaporg/decap-cms)

## 🐛 Troubleshooting

### CMS shows "Error: Failed to load entries"
- Check that your repository name is correct in `config.yml`
- Verify the branch name matches your actual branch
- Ensure you've granted OAuth app access to the repository

### Authentication fails with 404 error
- **Deploy an OAuth proxy first** - this is the #1 cause of 404 errors
- Verify `base_url` in `config.yml` points to your deployed OAuth proxy
- Check that your OAuth proxy is accessible (visit the URL in your browser)
- Ensure you're using `backend: name: github`, not `git-gateway`
- See [`/oauth-proxy/README.md`](../oauth-proxy/README.md) for deployment instructions

### "Cannot read property 'token' of undefined"
- The OAuth callback might be misconfigured
- Verify the callback URL in your GitHub OAuth App matches: `https://your-oauth-proxy-url/callback`
- Ensure your OAuth proxy is properly handling the `/success` endpoint

### Changes not saving to GitHub
- Ensure you've authorized the OAuth app for your repository
- Check that the GitHub account has write permissions to the repository
- Verify there are no branch protection rules preventing commits

## ✅ Testing Your Setup

1. Navigate to `/admin/` on your deployed site
2. Click "Login with GitHub"
3. Authorize the application when prompted
4. You should see the CMS admin interface
5. Try creating a test post
6. Verify the commit appears in your GitHub repository

## 📧 Support

For issues specific to this configuration, check the [Decap CMS GitHub Discussions](https://github.com/decaporg/decap-cms/discussions).
