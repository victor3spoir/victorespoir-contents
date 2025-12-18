# Victor Espoir Contents Repository

This repository serves as a CMS-like content management system for blog posts, using **Decap CMS** with **GitHub authentication only** - no Netlify services required.

## 🎯 Overview

This is a content repository that stores Markdown blog posts and provides a web-based CMS interface for editing them. Content is committed directly to GitHub, making it perfect for static site generators and JAMstack applications.

## 🚀 Quick Start

### Prerequisites

1. A GitHub account with access to this repository
2. A GitHub OAuth App configured for Decap CMS

### Setting Up GitHub OAuth

1. **Create a GitHub OAuth App**:
   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"
   - **Application name**: `Decap CMS for Victor Espoir`
   - **Homepage URL**: `https://victor3spoir.github.io/victorespoir-contents/`
   - **Callback URL**: `https://auth.decapcms.org/callback` ⚠️ (Must be exact)

2. **Save your credentials**:
   - Copy the **Client ID** 
   - Generate and securely store the **Client Secret**

3. **Configure OAuth Proxy**:
   - For production, consider self-hosting the OAuth server
   - For testing, Decap provides a shared proxy at `https://auth.decapcms.org`
   - See [`admin/README.md`](./admin/README.md) for detailed instructions

### Accessing the CMS

Once configured, access the admin interface at:

```
https://victor3spoir.github.io/victorespoir-contents/admin/
```

## 📁 Repository Structure

```
.
├── admin/
│   ├── config.yml          # Decap CMS configuration
│   ├── index.html          # Admin interface entry point
│   └── README.md           # Detailed setup instructions
├── content/
│   └── posts/              # Blog posts in Markdown format
├── .github/
│   └── workflows/
│       └── static.yml      # GitHub Pages deployment
└── README.md               # This file
```

## 📝 Content Structure

Blog posts are stored in `content/posts/` as Markdown files with frontmatter:

```markdown
---
title: "Post Title"
date: "2025-01-01"
image: "/images/example.jpg"
---

Your post content here...
```

## ⚙️ Configuration Details

### Backend: GitHub (No Netlify)

The CMS is configured to work exclusively with GitHub:

```yaml
backend:
  name: github
  repo: victor3spoir/victorespoir-contents
  branch: main
  base_url: https://auth.decapcms.org  # Decap OAuth proxy (not Netlify)
```

**Key Points:**
- ✅ Uses GitHub backend for direct repository access
- ✅ Authenticates via GitHub OAuth
- ✅ Uses Decap's OAuth proxy (not Netlify's)
- ✅ Commits changes directly to this repository
- ❌ No Netlify services required
- ❌ No Git Gateway dependency

### Why `base_url` is Critical

Without the `base_url` setting, Decap CMS may default to Netlify's authentication services. The `base_url: https://auth.decapcms.org` configuration ensures that:

1. Authentication goes through Decap's official OAuth proxy
2. No Netlify account or services are required
3. The CMS works with any static hosting (GitHub Pages, Vercel, etc.)

See [`admin/README.md`](./admin/README.md) for a complete explanation of why this configuration is necessary and common pitfalls to avoid.

## 🔐 Authentication Flow

```
User → CMS Admin → Decap OAuth Proxy → GitHub OAuth → Authorized → CMS Interface
```

1. User clicks "Login with GitHub" in the CMS
2. Redirected to `auth.decapcms.org` 
3. Redirected to GitHub for authorization
4. User grants access to the repository
5. Redirected back to CMS with authentication token
6. User can now create/edit posts that commit to GitHub

## 🌐 Deployment

This repository is automatically deployed to GitHub Pages using GitHub Actions. Any push to the `main` branch triggers a deployment.

**Live Admin Interface**: https://victor3spoir.github.io/victorespoir-contents/admin/

## 📚 Documentation

- **[Admin Setup Guide](./admin/README.md)**: Complete guide to configuring Decap CMS with GitHub authentication
- **[Decap CMS Docs](https://decapcms.org/docs/)**: Official Decap CMS documentation
- **[GitHub Backend](https://decapcms.org/docs/github-backend/)**: GitHub backend configuration reference

## 🐛 Troubleshooting

### Authentication Issues

If authentication fails or redirects to Netlify:

1. Verify `base_url: https://auth.decapcms.org` is set in `admin/config.yml`
2. Check that your GitHub OAuth App callback URL is exactly: `https://auth.decapcms.org/callback`
3. Ensure you're not using `git-gateway` backend (use `github` instead)
4. Clear browser cache and try again

### Content Not Saving

If posts don't commit to GitHub:

1. Verify you authorized the OAuth app for this repository
2. Check that your GitHub account has write access
3. Ensure there are no branch protection rules blocking commits

### Common Mistakes

See the [Common Authentication Mistakes](./admin/README.md#-common-authentication-mistakes) section in the admin README for a comprehensive list of pitfalls and solutions.

## 🛠️ Development

### Local Testing

To test the CMS locally, you'll need to:

1. Serve the files with a local web server (e.g., `python -m http.server`)
2. Configure your GitHub OAuth App with a local callback
3. Use a tool like [netlify-cms-proxy-server](https://www.npmjs.com/package/netlify-cms-proxy-server) for local development

Note: For local development, consider using the [Decap CMS Proxy Server](https://decapcms.org/docs/beta-features/#working-with-a-local-git-repository) which allows editing without authentication.

### Adding New Fields

Edit `admin/config.yml` to add new fields to the post schema:

```yaml
fields:
  - { label: "Title", name: "title", widget: "string" }
  - { label: "Date", name: "date", widget: "datetime" }
  - { label: "Author", name: "author", widget: "string" }  # New field
  - { label: "Body", name: "body", widget: "markdown" }
```

## 📄 License

This is a content repository. Content licensing should be specified by the repository owner.

## 🤝 Contributing

To contribute content:

1. Use the CMS admin interface (recommended)
2. Or create/edit Markdown files in `content/posts/` and submit a pull request

## 📧 Questions?

For configuration questions, see the detailed [Admin Setup Guide](./admin/README.md).

For Decap CMS issues, visit the [Decap CMS GitHub Discussions](https://github.com/decaporg/decap-cms/discussions).
