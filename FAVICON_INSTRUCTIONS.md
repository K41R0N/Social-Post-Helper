# Favicon Setup Instructions

## Adding the Go-Round Logo as Favicon

To complete the favicon setup, you need to save the logo image to the `client/public` directory:

1. **Save the logo image** (the coral market tent icon) as:
   - `client/public/favicon.png` (PNG format, recommended size: 512x512px)
   - Optional: Also create `client/public/favicon.ico` for broader compatibility

2. **Recommended sizes for optimal display:**
   - `favicon.png` - 512x512px (will be auto-scaled by browsers)
   - `favicon-16x16.png` - 16x16px (for browser tabs)
   - `favicon-32x32.png` - 32x32px (for desktop shortcuts)
   - `apple-touch-icon.png` - 180x180px (for iOS devices)

3. **The HTML is already configured** to reference `/favicon.png` in:
   - `client/index.html` lines 14-15

4. **For production deployment on Netlify:**
   - The environment variable `VITE_APP_LOGO` is set to `/favicon.png` in `netlify.toml`
   - Just ensure the `favicon.png` file exists in `client/public/` before building

## Converting the Logo

If you need to convert the logo to different formats:

```bash
# Using ImageMagick (if installed)
convert logo.png -resize 512x512 client/public/favicon.png
convert logo.png -resize 180x180 client/public/apple-touch-icon.png
convert logo.png -resize 32x32 client/public/favicon-32x32.png
convert logo.png -resize 16x16 client/public/favicon-16x16.png
```

Or use an online tool like:
- https://favicon.io/
- https://realfavicongenerator.net/

## Verification

After adding the favicon:
1. Run `pnpm dev` to test locally
2. Visit `http://localhost:3000` in your browser
3. Check the browser tab - you should see the Go-Round logo icon
4. Build and deploy to Netlify: `pnpm build`

The logo should appear in:
- Browser tabs
- Bookmarks
- Mobile home screen (when saved as a web app)
- Social media previews (via Open Graph tags)
