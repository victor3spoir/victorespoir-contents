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

### Step 1: Create a GitHub OAuth App

To enable authentication, you need to create a GitHub OAuth App:

1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
   - Or visit: https://github.com/settings/developers

2. Fill in the application details:
   - **Application name**: `Decap CMS for [Your Site Name]`
   - **Homepage URL**: `https://victor3spoir.github.io/victorespoir-contents/` (or your actual site URL)
   - **Authorization callback URL**: `https://auth.decapcms.org/callback`
     - ⚠️ **CRITICAL**: This MUST be `https://auth.decapcms.org/callback` exactly
     - This is the Decap OAuth proxy endpoint, NOT your site URL

3. Click **Register application**

4. You'll receive:
   - **Client ID**: A public identifier (safe to commit)
   - **Client Secret**: Generate and securely store this (never commit to repo)

### Step 2: Configure the OAuth App with Decap

The OAuth App needs to be registered with Decap's OAuth proxy service. There are two approaches:

#### Option A: Self-Hosted OAuth Proxy (Recommended for Production)

For production use, you should host your own OAuth server. Resources:
- [External OAuth Clients Guide](https://decapcms.org/docs/external-oauth-clients/)
- [Community OAuth Provider](https://github.com/daviddarnes/netlify-cms-oauth-provider) - Ready-to-deploy solution

#### Option B: Decap's Shared OAuth Proxy (Quick Setup)

Decap provides a shared OAuth proxy at `https://auth.decapcms.org` that can be used for testing and small projects. This proxy works with properly configured GitHub OAuth Apps without requiring manual registration.

**Important Notes:**
- The shared proxy is suitable for personal projects and testing
- For production use at scale, consider self-hosting for better reliability and control
- Ensure your GitHub OAuth App callback URL is set to `https://auth.decapcms.org/callback`

### Step 3: Access the CMS

Once configured, access the CMS at:
```
https://victor3spoir.github.io/victorespoir-contents/admin/
```

The CMS will:
1. Redirect you to GitHub for authentication
2. Request permission to access your repository
3. Redirect back to your CMS admin interface
4. Allow you to create/edit content that commits directly to GitHub

## 🔍 Why Does Decap CMS Redirect to Netlify by Default?

### Historical Context

**Decap CMS** was originally called **Netlify CMS** and was created by Netlify. When it became an independent project in 2023, it was renamed to Decap CMS, but some default behaviors remained:

1. **Legacy Default**: Without explicit configuration, Decap CMS may still try to use Netlify's authentication services
2. **Git Gateway**: The old default backend was `git-gateway`, which is a Netlify-specific service
3. **OAuth Proxy**: Netlify provided (and still provides) an OAuth proxy service for their hosted sites

### The Solution: `base_url`

The critical configuration that prevents Netlify redirection is:

```yaml
backend:
  name: github          # Use GitHub backend directly
  base_url: https://auth.decapcms.org  # Use Decap's OAuth proxy, not Netlify's
```

**Without `base_url`**: Decap CMS might default to Netlify's OAuth proxy or fail to authenticate properly.

**With `base_url`**: You explicitly tell Decap CMS to use the official Decap OAuth proxy service.

## ⚠️ Common Authentication Mistakes

### 1. Wrong Callback URL

**❌ WRONG:**
```
https://victor3spoir.github.io/victorespoir-contents/admin/callback
```

**✅ CORRECT:**
```
https://auth.decapcms.org/callback
```

The callback URL must point to the OAuth proxy server, NOT your website. The proxy handles the OAuth flow and then redirects to your site.

### 2. Using `git-gateway` Backend

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

### 3. Missing `base_url`

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

### 4. Incorrect Repository Format

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

### 5. Branch Name Mismatch

Ensure the branch in `config.yml` matches your actual default branch:

```yaml
branch: main  # or 'master' if that's your default branch
```

### 6. CORS Issues

If hosting on a custom domain, ensure your OAuth proxy allows requests from your domain. The Decap proxy should handle this automatically for GitHub Pages.

### 7. Missing Repository Permissions

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
       │ 2. Redirect to auth.decapcms.org
       ▼
┌─────────────────────┐
│  Decap OAuth Proxy  │
│ auth.decapcms.org   │
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
│  Decap OAuth Proxy  │
│ (processes token)   │
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

### Authentication fails or redirects to Netlify
- Verify `base_url: https://auth.decapcms.org` is set in `config.yml`
- Check that you're using `backend: name: github`, not `git-gateway`
- Clear browser cache and try again

### "Cannot read property 'token' of undefined"
- The OAuth callback might be misconfigured
- Verify the callback URL in your GitHub OAuth App is exactly: `https://auth.decapcms.org/callback`

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
