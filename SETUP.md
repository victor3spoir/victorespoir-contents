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

### Step 1: Understand the Configuration ✅

The repository is already configured with the correct `admin/config.yml`:

```yaml
backend:
  name: github                           # Use GitHub backend
  repo: victor3spoir/victorespoir-contents  # Your repository
  branch: main                           # Target branch
  base_url: https://auth.decapcms.org   # ⭐ KEY: Use Decap OAuth proxy
```

**Why `base_url` matters:**
- ❌ Without it: Decap CMS may redirect to Netlify or fail to authenticate
- ✅ With it: Authentication goes through Decap's official OAuth proxy

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
| **Authorization callback URL** | `https://auth.decapcms.org/callback` |

⚠️ **CRITICAL**: The callback URL MUST be exactly:
```
https://auth.decapcms.org/callback
```

**Common Mistakes to Avoid:**
- ❌ `https://victor3spoir.github.io/victorespoir-contents/admin/callback`
- ❌ `https://auth.decapcms.org/`
- ❌ `https://api.netlify.com/auth/done`

The callback URL must point to the OAuth proxy, not your site!

#### 2.3 Save Your Credentials

After clicking "Register application", you'll see:

1. **Client ID**: Something like `Iv1.a629723300032020`
   - This is public and can be shared
   - You'll need this for the next step

2. **Client secrets**: Click "Generate a new client secret"
   - Copy this immediately - you can't see it again!
   - Store it securely (password manager, secure notes, etc.)
   - Never commit this to your repository

### Step 3: Configure OAuth Proxy 🔄

You have two options:

#### Option A: Self-Hosted OAuth Server (Recommended for Production)

For production use, deploy your own OAuth server:

1. Use the official Decap OAuth server: https://github.com/decaporg/decap-cms/tree/master/packages/decap-cms-lib-auth
2. Or use a community solution like:
   - https://github.com/daviddarnes/netlify-cms-oauth-provider
   - Deploy to Vercel, Heroku, or any Node.js hosting

3. Update your `config.yml` with your server URL:
```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://your-oauth-server.vercel.app  # Your server
```

#### Option B: Decap's Shared Proxy (For Testing)

⚠️ **Note**: The shared proxy at `https://auth.decapcms.org` is for testing. For production, consider option A.

The current configuration already uses this:
```yaml
base_url: https://auth.decapcms.org
```

However, you may need to register your OAuth credentials with the proxy or deploy your own server.

### Step 4: Test the Setup ✨

#### 4.1 Access the Admin Interface

Navigate to:
```
https://victor3spoir.github.io/victorespoir-contents/admin/
```

#### 4.2 Authentication Flow

1. You should see the Decap CMS interface with a "Login with GitHub" button
2. Click the button
3. You'll be redirected to `auth.decapcms.org`
4. Then redirected to GitHub's authorization page
5. GitHub will ask you to authorize the OAuth app
6. Click "Authorize [your-app-name]"
7. You'll be redirected back to the CMS admin interface

#### 4.3 Verify Access

If successful, you should see:
- The CMS dashboard
- "Articles" collection in the sidebar
- Existing posts listed
- "New Articles" button to create posts

#### 4.4 Test Creating Content

1. Click "New Articles"
2. Fill in:
   - Titre (Title)
   - Date
   - Image (optional)
   - Contenu (Content)
3. Click "Publish"
4. Check your GitHub repository - you should see a new commit!

### Step 5: Troubleshooting 🔧

#### Problem: "Failed to load config.yml"

**Solutions:**
- Clear browser cache
- Verify the file is accessible at `https://victor3spoir.github.io/victorespoir-contents/admin/config.yml`
- Check YAML syntax is valid

#### Problem: Redirects to Netlify

**Solutions:**
- Verify `base_url: https://auth.decapcms.org` is in your `config.yml`
- Ensure you're not using `name: git-gateway` (should be `name: github`)
- Clear browser cache and cookies
- Try in incognito/private mode

#### Problem: "Authentication failed"

**Solutions:**
1. Verify GitHub OAuth App callback URL is exactly: `https://auth.decapcms.org/callback`
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

- [ ] `admin/config.yml` has `backend.name: github`
- [ ] `admin/config.yml` has `base_url: https://auth.decapcms.org`
- [ ] GitHub OAuth App created
- [ ] OAuth App callback URL is `https://auth.decapcms.org/callback`
- [ ] Client ID and Client Secret saved securely
- [ ] Can access admin interface at `/admin/`
- [ ] "Login with GitHub" button appears
- [ ] Authentication redirects to GitHub
- [ ] Can authorize the app successfully
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
