# Deployment Guide

This guide covers deploying the Carousel Builder to various hosting platforms. The app is a static site with no backend requirements, making deployment straightforward.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Netlify Deployment](#netlify-deployment-recommended)
- [Vercel Deployment](#vercel-deployment)
- [GitHub Pages](#github-pages)
- [Cloudflare Pages](#cloudflare-pages)
- [Custom Server](#custom-server)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 22.x or higher installed
- ✅ pnpm 9.x or higher installed
- ✅ Git repository with your code
- ✅ Account on your chosen hosting platform

---

## Netlify Deployment (Recommended)

Netlify is the recommended platform due to automatic configuration detection and zero-config deployment.

### Method 1: Deploy from GitHub (Easiest)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/carousel-builder.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [https://app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository

3. **Configure build settings** (auto-detected from `netlify.toml`)
   - Build command: `pnpm install && pnpm build`
   - Publish directory: `dist`
   - Node version: 22.13.0
   
   **Note**: These settings are automatically detected from `netlify.toml`. No manual configuration needed!

4. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes for the build to complete
   - Your site will be live at `https://random-name-12345.netlify.app`

5. **Custom domain** (optional)
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow DNS configuration instructions

### Method 2: Deploy from CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize site**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Continuous Deployment

Once connected to GitHub, Netlify automatically deploys on every push to your main branch. No additional configuration needed!

---

## Vercel Deployment

Vercel offers similar zero-config deployment with excellent performance.

### Method 1: Deploy from GitHub

1. **Push your code to GitHub** (same as Netlify step 1)

2. **Connect to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure build settings**
   - Framework Preset: **Vite**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
   - Node Version: **22.x**

4. **Deploy**
   - Click "Deploy"
   - Your site will be live at `https://your-project.vercel.app`

### Method 2: Deploy from CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

---

## GitHub Pages

GitHub Pages is free for public repositories and integrates directly with GitHub.

### Setup

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Install gh-pages**
   ```bash
   pnpm add -D gh-pages
   ```

3. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "pnpm build && gh-pages -d dist"
     }
   }
   ```

4. **Update vite.config.ts** (add base path)
   ```typescript
   export default defineConfig({
     base: '/carousel-builder/', // Replace with your repo name
     // ... rest of config
   })
   ```

5. **Deploy**
   ```bash
   pnpm deploy
   ```

6. **Configure GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages"
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

Your site will be live at `https://yourusername.github.io/carousel-builder/`

---

## Cloudflare Pages

Cloudflare Pages offers fast global CDN and excellent performance.

### Deploy from GitHub

1. **Push your code to GitHub** (same as above)

2. **Connect to Cloudflare Pages**
   - Go to [https://pages.cloudflare.com](https://pages.cloudflare.com)
   - Click "Create a project"
   - Connect your GitHub account
   - Select your repository

3. **Configure build settings**
   - Framework preset: **Vite**
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Environment variables: None required

4. **Deploy**
   - Click "Save and Deploy"
   - Your site will be live at `https://your-project.pages.dev`

---

## Custom Server

You can host the built files on any static file server.

### Build the Project

```bash
pnpm build
```

This creates a `dist/` directory with all static files.

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/carousel-builder/dist;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache Configuration

Create `.htaccess` in the `dist/` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

---

## Environment Variables

### ✅ No Environment Variables Required!

This application runs entirely in the browser with no backend. All data is stored in browser localStorage. **You do not need to configure any environment variables for deployment.**

### Optional Customization

If you want to customize the app, edit `src/const.ts` directly in the source code:

```typescript
// src/const.ts
export const APP_TITLE = "Carousel Builder";
export const APP_LOGO = "/logo.svg";

export const DEFAULT_EXPORT_PRESETS = [
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  // ... add more presets
];
```

Then rebuild and redeploy:
```bash
pnpm build
```

---

## Troubleshooting

### Build Fails with "pnpm not found"

**Solution**: Ensure pnpm is installed and specified in build settings.

For Netlify, the `netlify.toml` already specifies `PNPM_VERSION = "9"`.

For other platforms, install pnpm before building:
```bash
npm install -g pnpm@9
pnpm build
```

### 404 Errors on Page Refresh

**Problem**: The app uses client-side routing. When you refresh a page like `/editor`, the server looks for `/editor/index.html` which doesn't exist.

**Solution**: Configure your server to redirect all requests to `index.html`.

- **Netlify**: Handled automatically by `netlify.toml`
- **Vercel**: Handled automatically
- **GitHub Pages**: Add a `404.html` that redirects to `index.html`
- **Custom server**: See Nginx/Apache configuration above

### Fonts Not Loading

**Problem**: Custom fonts in `public/fonts/` are not loading after deployment.

**Solution**: Check that font files are included in the build:
1. Verify fonts are in `public/fonts/` directory
2. Check `@font-face` declarations in `src/index.css`
3. Ensure font paths are correct (should be `/fonts/fontname.woff2`)

### LocalStorage Data Lost

**Problem**: Projects disappear after deployment.

**Explanation**: This is expected behavior. LocalStorage is browser-specific and domain-specific. Data from `localhost` won't transfer to your production domain.

**Solution**: 
- Export projects as CSV before deployment
- Re-import CSV files on the production site
- Consider implementing export/import functionality for users

### Build Size Too Large

**Problem**: The `dist/` folder is larger than expected.

**Solution**: Vite automatically optimizes the build. If you need further optimization:

1. **Remove unused dependencies**
   ```bash
   pnpm prune
   ```

2. **Analyze bundle size**
   ```bash
   pnpm add -D rollup-plugin-visualizer
   ```
   
   Add to `vite.config.ts`:
   ```typescript
   import { visualizer } from 'rollup-plugin-visualizer';
   
   export default defineConfig({
     plugins: [
       // ... other plugins
       visualizer({ open: true })
     ]
   });
   ```

3. **Enable compression** on your hosting platform (usually automatic)

### Monaco Editor Not Loading

**Problem**: The code editor in Settings → Custom Layouts doesn't load.

**Solution**: Monaco Editor is loaded from CDN. Ensure:
1. Your hosting platform allows external scripts
2. CSP headers (if any) allow `https://cdn.jsdelivr.net`

---

## Performance Optimization

### Recommended Settings

1. **Enable HTTP/2** on your server
2. **Enable gzip/brotli compression**
3. **Set cache headers** for static assets (1 year)
4. **Use a CDN** (Netlify, Vercel, and Cloudflare include this automatically)

### Lighthouse Score

The app should achieve:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

Run Lighthouse in Chrome DevTools to verify.

---

## Security Considerations

### Content Security Policy (CSP)

If you add a CSP header, ensure it allows:
- `script-src`: `'self' 'unsafe-inline' https://cdn.jsdelivr.net` (for Monaco Editor)
- `style-src`: `'self' 'unsafe-inline' https://fonts.googleapis.com`
- `font-src`: `'self' https://fonts.gstatic.com`
- `img-src`: `'self' data: blob:` (for html2canvas)

### HTTPS

Always deploy with HTTPS enabled. All major platforms (Netlify, Vercel, Cloudflare, GitHub Pages) provide free SSL certificates automatically.

---

## Monitoring

### Recommended Tools

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics, Plausible, Fathom
- **Error tracking**: Sentry, LogRocket

### Adding Analytics

To add Google Analytics, edit `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/yourusername/carousel-builder/issues)
2. Open a new issue with:
   - Hosting platform
   - Build logs
   - Error messages
   - Steps to reproduce

---

**Happy deploying! 🚀**
