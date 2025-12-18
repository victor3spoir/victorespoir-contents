# 🚀 Quick Start Guide

⚠️ **IMPORTANT UPDATE**: This guide has been updated to fix authentication issues.

## 🚨 Authentication Fix Required

The previous setup used `https://auth.decapcms.org` which **does not exist**, causing 404 errors.

**→ See [`AUTHENTICATION_FIX.md`](./AUTHENTICATION_FIX.md) for the fix!**

Or continue below for the updated quick start.

## 🎯 What You Get

A web-based content management interface that:
- ✅ Authenticates with GitHub OAuth
- ✅ Commits content directly to this repository
- ✅ Works with GitHub Pages or any static hosting
- ✅ Manages Markdown blog posts with a visual editor

## ⚡ Updated Setup (10 minutes)

### 1️⃣ Deploy OAuth Proxy (5 minutes)

**You must deploy your own OAuth proxy for authentication to work.**

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare (free account)
wrangler login

# Deploy the worker
cd oauth-proxy
wrangler deploy
```

Save your worker URL (e.g., `https://decap-cms-oauth.your-subdomain.workers.dev`)

### 2️⃣ Create GitHub OAuth App (2 minutes)

Visit: **https://github.com/settings/developers**

Click "New OAuth App" and enter:

| Field | Value |
|-------|-------|
| Application name | `Decap CMS - Victor Espoir` |
| Homepage URL | `https://victor3spoir.github.io/victorespoir-contents/` |
| Callback URL | `https://your-worker-url.workers.dev/callback` |

⚠️ **Critical**: Use YOUR worker URL from Step 1, not `auth.decapcms.org`

Save your **Client ID** and **Client Secret**.

### 3️⃣ Configure OAuth Proxy (2 minutes)

Add your GitHub credentials to Cloudflare:

```bash
cd oauth-proxy
wrangler secret put OAUTH_CLIENT_ID     # Paste your Client ID
wrangler secret put OAUTH_CLIENT_SECRET # Paste your Client Secret
```

### 4️⃣ Update CMS Config (1 minute)

Edit `admin/config.yml`:

```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://your-worker-url.workers.dev  # YOUR worker URL
```

### 5️⃣ Test Authentication

1. Go to: `https://victor3spoir.github.io/victorespoir-contents/admin/`
2. Click "Login with GitHub"
3. Authorize the app when GitHub prompts you
4. You're in! 🎉

### 6️⃣ Create Your First Post (2 minutes)

1. Click "New Articles"
2. Fill in:
   - **Titre**: Your post title
   - **Date**: Publication date
   - **Image**: Optional featured image
   - **Contenu**: Your post content (Markdown supported)
3. Click "Publish"
4. Check your repository - you'll see a new commit!

## 🎊 You're Done!

That's it! You now have a fully functional CMS.

## 📚 Next Steps

- **Need detailed setup?** → See [SETUP.md](./SETUP.md)
- **Troubleshooting?** → See [admin/README.md](./admin/README.md)
- **Customize fields?** → Edit [admin/config.yml](./admin/config.yml)

## ❓ Common Questions

### Q: Do I need a Netlify account?
**A:** No! This setup works without any Netlify services.

### Q: Where is my content stored?
**A:** In this GitHub repository under `content/posts/` as Markdown files.

### Q: Can I use this with my own website?
**A:** Yes! The content is stored in Markdown format, which works with any static site generator (Hugo, Jekyll, Next.js, etc.)

### Q: Why do I need to deploy an OAuth proxy?
**A:** Decap CMS requires an OAuth proxy to securely authenticate with GitHub. There is no public shared proxy - you must deploy your own (using our free Cloudflare Worker template).

### Q: Can other people use the CMS?
**A:** Yes! Anyone you authorize via the GitHub OAuth app can access the CMS. They need write access to your repository.

### Q: What if I get a 404 error?
**A:** The OAuth proxy is not deployed or `base_url` is not configured. See [`AUTHENTICATION_FIX.md`](./AUTHENTICATION_FIX.md).

### Q: What if authentication fails?
**A:** Check that your GitHub OAuth callback URL matches your worker URL + `/callback`.

## 🔗 Important Links

- **CMS Admin**: https://victor3spoir.github.io/victorespoir-contents/admin/
- **Repository**: https://github.com/victor3spoir/victorespoir-contents
- **GitHub OAuth Apps**: https://github.com/settings/developers
- **Decap CMS Docs**: https://decapcms.org/docs/

## 🆘 Need Help?

1. Check [SETUP.md](./SETUP.md) for detailed instructions
2. Review [Common Mistakes](./admin/README.md#-common-authentication-mistakes)
3. Visit [Decap CMS Discussions](https://github.com/decaporg/decap-cms/discussions)

---

**Happy content creating! ✨**
