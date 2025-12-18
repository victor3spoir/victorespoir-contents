# Decap CMS GitHub Authentication - Complete Setup Guide

This guide walks you through setting up Decap CMS with GitHub authentication (no Netlify required) from scratch.

## 📋 Prerequisites

- A GitHub account with admin access to this repository
- The repository deployed to GitHub Pages (or any static hosting)
- 10 minutes to complete the setup

## 🎯 What You'll Achieve

By the end of this guide, you'll have a fully functional CMS that:
- Authenticates users via GitHub OAuth
- Commits content directly to this GitHub repository
- Works without any Netlify services
- Can be accessed at `https://[your-username].github.io/[repo-name]/admin/`

## 📖 Step-by-Step Setup

### Step 1: Deploy an OAuth Proxy 🔐

⚠️ **IMPORTANT**: You must deploy your own OAuth proxy before authentication will work.

**Quick Setup with Cloudflare Workers (Free)**:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
cd oauth-proxy
wrangler deploy
```

You'll get a URL like: `https://decap-cms-oauth.your-subdomain.workers.dev`

**Set your secrets** (you'll add these in Step 2):
```bash
wrangler secret put OAUTH_CLIENT_ID
wrangler secret put OAUTH_CLIENT_SECRET
```

See [`oauth-proxy/README.md`](./oauth-proxy/README.md) for detailed instructions and alternative deployment options.

### Step 2: Create GitHub OAuth App 🔐

#### 2.1 Navigate to GitHub Settings

Go to: **https://github.com/settings/developers**

Or manually:
1. Click your profile picture (top-right)
2. Settings
3. Developer settings (bottom of left sidebar)
4. OAuth Apps
5. New OAuth App

#### 2.2 Fill in the Form

| Field | Value |
|-------|-------|
| **Application name** | `Decap CMS - Victor Espoir Contents` |
| **Homepage URL** | `https://victor3spoir.github.io/victorespoir-contents/` |
| **Application description** | `Content management for victorespoir-contents` (optional) |
| **Authorization callback URL** | `https://your-worker-url.workers.dev/callback` |

⚠️ **CRITICAL**: The callback URL MUST match your deployed OAuth proxy:
```
https://your-worker-url.workers.dev/callback
```

Replace `your-worker-url.workers.dev` with the actual URL from Step 1.

**Common Mistakes to Avoid:**
- ❌ `https://victor3spoir.github.io/victorespoir-contents/admin/callback` (wrong - this is your site)
- ❌ `https://auth.decapcms.org/callback` (wrong - this service doesn't exist)
- ❌ `https://api.netlify.com/auth/done` (wrong - not using Netlify)

The callback URL must point to YOUR OAuth proxy, not your site!

#### 2.3 Save Your Credentials

After clicking "Register application", you'll see:

1. **Client ID**: Something like `Iv1.a629723300032020`
   - This is public and can be shared
   - You'll need this for the next step

2. **Client secrets**: Click "Generate a new client secret"
   - Copy this immediately - you can't see it again!
   - Store it securely (password manager, secure notes, etc.)
   - Never commit this to your repository

### Step 3: Configure Your OAuth Proxy with Secrets 🔑

Add your GitHub OAuth credentials to your Cloudflare Worker:

```bash
cd oauth-proxy

# Set your Client ID
wrangler secret put OAUTH_CLIENT_ID
# Paste your Client ID when prompted

# Set your Client Secret
wrangler secret put OAUTH_CLIENT_SECRET
# Paste your Client Secret when prompted
```

Verify secrets are set:
```bash
wrangler secret list
```

### Step 4: Update CMS Configuration ⚙️

Edit `admin/config.yml` and set your OAuth proxy URL:

```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://your-worker-url.workers.dev  # Your Cloudflare Worker URL
```

Replace `your-worker-url.workers.dev` with your actual deployed worker URL from Step 1.

### Step 5: Test the Setup ✨

#### 5.1 Access the Admin Interface

Navigate to:
```
https://victor3spoir.github.io/victorespoir-contents/admin/
```

#### 5.2 Authentication Flow

1. You should see the Decap CMS interface with a "Login with GitHub" button
2. Click the button
3. You'll be redirected to your OAuth proxy (e.g., `your-worker.workers.dev`)
4. Then redirected to GitHub's authorization page
5. GitHub will ask you to authorize the OAuth app
6. Click "Authorize [your-app-name]"
7. You'll be redirected back through your OAuth proxy
8. Finally redirected back to the CMS admin interface, now authenticated!

#### 5.3 Verify Access

If successful, you should see:
- The CMS dashboard
- "Articles" collection in the sidebar
- Existing posts listed
- "New Articles" button to create posts

#### 5.4 Test Creating Content

1. Click "New Articles"
2. Fill in:
   - Titre (Title)
   - Date
   - Image (optional)
   - Contenu (Content)
3. Click "Publish"
4. Check your GitHub repository - you should see a new commit!

### Step 6: Troubleshooting 🔧

#### Problem: "Failed to load config.yml"

**Solutions:**
- Clear browser cache
- Verify the file is accessible at `https://victor3spoir.github.io/victorespoir-contents/admin/config.yml`
- Check YAML syntax is valid

#### Problem: 404 Error on Authentication

**Solutions:**
- **Deploy an OAuth proxy first** - this is the most common issue
- Verify your OAuth proxy is accessible: visit the URL in a browser
- Check `base_url` in `config.yml` matches your deployed OAuth proxy URL exactly
- Ensure you're not using `name: git-gateway` (should be `name: github`)
- See [`oauth-proxy/README.md`](./oauth-proxy/README.md) for deployment help

#### Problem: "Authentication failed"

**Solutions:**
1. Verify GitHub OAuth App callback URL matches: `https://your-worker-url.workers.dev/callback`
2. Check that you've authorized the app in GitHub
3. Ensure your OAuth app has access to the repository
4. For organization repos, verify the org allows OAuth apps

#### Problem: "Cannot commit to repository"

**Solutions:**
- Verify your GitHub account has write access to the repository
- Check for branch protection rules
- Ensure the branch name in `config.yml` matches your actual branch
- Re-authorize the OAuth app with full permissions

#### Problem: "Error loading entries"

**Solutions:**
- Verify repository name format: `owner/repo` (not a URL)
- Check the branch name is correct
- Ensure `content/posts` directory exists
- Verify you have read access to the repository

## 🔐 Security Best Practices

### DO:
✅ Store Client Secret securely (never commit to repo)  
✅ Use HTTPS for all URLs  
✅ Regularly rotate OAuth secrets  
✅ Review authorized applications periodically  
✅ Use a self-hosted OAuth server for production  

### DON'T:
❌ Commit OAuth secrets to your repository  
❌ Share Client Secret publicly  
❌ Use the same OAuth app for multiple sites  
❌ Rely on shared OAuth proxies for production  

## 🚀 Going to Production

When you're ready for production:

1. **Deploy Your Own OAuth Server**
   - More reliable than shared proxy
   - Better control over authentication
   - See: https://decapcms.org/docs/external-oauth-clients/

2. **Configure Custom Domain** (optional)
   - Set up a custom domain for your site
   - Update OAuth App URLs accordingly

3. **Set Up Branch Protection**
   - Protect your main branch
   - Require reviews for CMS commits (optional)

4. **Monitor Repository Activity**
   - Check commits made through CMS
   - Set up notifications for new content

## 📚 Additional Resources

### Documentation
- [Decap CMS Documentation](https://decapcms.org/docs/)
- [GitHub Backend Guide](https://decapcms.org/docs/github-backend/)
- [External OAuth Clients](https://decapcms.org/docs/external-oauth-clients/)

### Community
- [Decap CMS GitHub](https://github.com/decaporg/decap-cms)
- [Decap CMS Discussions](https://github.com/decaporg/decap-cms/discussions)
- [Decap CMS Discord](https://decapcms.org/docs/community/)

### Tools
- [OAuth Server Template](https://github.com/daviddarnes/netlify-cms-oauth-provider)
- [Decap CMS Proxy Server](https://www.npmjs.com/package/netlify-cms-proxy-server) (for local development)

## ✅ Verification Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] OAuth proxy deployed (Cloudflare Worker or alternative)
- [ ] OAuth proxy URL is accessible (test in browser)
- [ ] OAuth proxy secrets configured (Client ID & Secret)
- [ ] GitHub OAuth App created
- [ ] OAuth App callback URL matches `https://your-worker-url.workers.dev/callback`
- [ ] `admin/config.yml` has `backend.name: github`
- [ ] `admin/config.yml` has `base_url` pointing to your OAuth proxy
- [ ] Client ID and Client Secret saved securely
- [ ] Can access admin interface at `/admin/`
- [ ] "Login with GitHub" button appears
- [ ] Authentication redirects through OAuth proxy to GitHub (no 404!)
- [ ] Can authorize the app successfully
- [ ] Redirected back to CMS after authorization
- [ ] Can see existing posts in CMS
- [ ] Can create a new test post
- [ ] Test post appears as commit in GitHub repository
- [ ] Can edit existing posts
- [ ] Edits appear as commits in GitHub

## 🎉 Success!

If you've completed all steps and can create/edit content through the CMS interface, congratulations! You now have a fully functional content management system backed by GitHub, with no Netlify dependencies.

## 💡 Next Steps

- Customize the CMS fields in `admin/config.yml`
- Add more collections (pages, authors, etc.)
- Configure media uploads
- Integrate with your main website/blog
- Set up editorial workflow
- Add custom previews

---

**Need Help?** See the detailed troubleshooting guide in [`admin/README.md`](./admin/README.md) or open an issue in the Decap CMS repository.
