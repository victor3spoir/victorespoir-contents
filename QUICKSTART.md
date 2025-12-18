# 🚀 Quick Start Guide

Get your Decap CMS up and running in 5 minutes!

## 🎯 What You Get

A web-based content management interface that:
- ✅ Authenticates with GitHub (no Netlify account needed)
- ✅ Commits content directly to this repository
- ✅ Works with GitHub Pages or any static hosting
- ✅ Manages Markdown blog posts with a visual editor

## 📍 Access Your CMS

Your CMS admin interface is available at:

```
https://victor3spoir.github.io/victorespoir-contents/admin/
```

## ⚡ 5-Minute Setup

### 1️⃣ Create GitHub OAuth App (2 minutes)

Visit: **https://github.com/settings/developers**

Click "New OAuth App" and enter:

| Field | Value |
|-------|-------|
| Application name | `Decap CMS - Victor Espoir` |
| Homepage URL | `https://victor3spoir.github.io/victorespoir-contents/` |
| Callback URL | `https://auth.decapcms.org/callback` ⚠️ |

⚠️ **Critical**: Callback URL must be exactly `https://auth.decapcms.org/callback`

### 2️⃣ Test Authentication (1 minute)

1. Go to: `https://victor3spoir.github.io/victorespoir-contents/admin/`
2. Click "Login with GitHub"
3. Authorize the app when GitHub prompts you
4. You're in! 🎉

### 3️⃣ Create Your First Post (2 minutes)

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

### Q: Is the shared OAuth proxy reliable?
**A:** Yes, for personal projects and small sites. For production sites with many users, consider [self-hosting the OAuth server](./SETUP.md#option-a-self-hosted-oauth-server-recommended-for-production).

### Q: Can other people use the CMS?
**A:** Yes! Anyone you authorize via the GitHub OAuth app can access the CMS. They need write access to your repository.

### Q: What if authentication fails?
**A:** Check the [troubleshooting guide](./admin/README.md#-common-authentication-mistakes) for common issues and solutions.

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
