# Victor Espoir Contents Repository

This repository serves as a CMS-like content management system for blog posts, using **Decap CMS** with **GitHub authentication only** - no Netlify services required.

## 🎯 Overview

This is a content repository that stores Markdown blog posts and provides a web-based CMS interface for editing them. Content is committed directly to GitHub, making it perfect for static site generators and JAMstack applications.

## 🚀 Quick Start

### Prerequisites

1. A GitHub account with access to this repository
2. A GitHub OAuth App configured for Decap CMS

### Setting Up Authentication

⚠️ **IMPORTANT**: Decap CMS requires an OAuth proxy to authenticate with GitHub. You must deploy your own OAuth proxy before the CMS will work.

**Quick Setup (3 steps)**:

1. **Deploy an OAuth Proxy**:
   - We provide a ready-to-use Cloudflare Worker (free tier available)
   - See [`oauth-proxy/README.md`](./oauth-proxy/README.md) for detailed setup instructions
   - Alternative: Use [DecapBridge](https://decapbridge.com/) (paid service, no deployment needed)

2. **Create a GitHub OAuth App**:
   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"
   - **Application name**: `Decap CMS for Victor Espoir`
   - **Homepage URL**: `https://victor3spoir.github.io/victorespoir-contents/`
   - **Callback URL**: `https://your-worker-url.workers.dev/callback` (use your actual OAuth proxy URL)

3. **Update Configuration**:
   - Edit `admin/config.yml` and set `base_url` to your OAuth proxy URL
   - See [`admin/README.md`](./admin/README.md) for complete instructions

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
  base_url: https://your-oauth-proxy-url  # Your deployed OAuth proxy
```

**Key Points:**
- ✅ Uses GitHub backend for direct repository access
- ✅ Authenticates via GitHub OAuth through your own proxy
- ✅ Commits changes directly to this repository
- ❌ No Netlify services required
- ❌ No Git Gateway dependency
- ⚠️ **Requires OAuth proxy deployment** (see [`oauth-proxy/README.md`](./oauth-proxy/README.md))

### Why an OAuth Proxy is Required

Decap CMS cannot authenticate directly with GitHub from the browser for security reasons. The `base_url` setting points to your OAuth proxy which:

1. Handles the secure OAuth handshake with GitHub
2. Exchanges authorization codes for access tokens
3. Returns tokens to the CMS client

**There is no public shared OAuth proxy** - you must deploy your own or use a third-party service. See [`oauth-proxy/README.md`](./oauth-proxy/README.md) for deployment options.

## 🔐 Authentication Flow

```
User → CMS Admin → Your OAuth Proxy → GitHub OAuth → Authorized → CMS Interface
```

1. User clicks "Login with GitHub" in the CMS
2. Redirected to your OAuth proxy (e.g., `your-worker.workers.dev`) 
3. OAuth proxy redirects to GitHub for authorization
4. User grants access to the repository
5. GitHub redirects back to OAuth proxy with authorization code
6. OAuth proxy exchanges code for access token
7. Token is returned to CMS, user is authenticated
8. User can now create/edit posts that commit to GitHub

## 🌐 Deployment

This repository is automatically deployed to GitHub Pages using GitHub Actions. Any push to the `main` branch triggers a deployment.

**Live Admin Interface**: https://victor3spoir.github.io/victorespoir-contents/admin/

## 📚 Documentation

- **[Admin Setup Guide](./admin/README.md)**: Complete guide to configuring Decap CMS with GitHub authentication
- **[Decap CMS Docs](https://decapcms.org/docs/)**: Official Decap CMS documentation
- **[GitHub Backend](https://decapcms.org/docs/github-backend/)**: GitHub backend configuration reference

## 🐛 Troubleshooting

### Authentication Issues

If you get a 404 error or authentication fails:

1. **Verify OAuth proxy is deployed**: The most common issue is not having an OAuth proxy deployed
2. **Check `base_url` in `admin/config.yml`**: Must point to your deployed OAuth proxy URL
3. **Verify GitHub OAuth App callback URL**: Must exactly match `https://your-oauth-proxy-url/callback`
4. **Ensure you're using `github` backend**: Not `git-gateway`
5. See [`oauth-proxy/README.md`](./oauth-proxy/README.md) for detailed troubleshooting

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
