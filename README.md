# Carousel Builder

A powerful, browser-based tool for creating stunning Instagram carousel posts with customizable layouts, fonts, and export options. Built with React, TypeScript, and Tailwind CSS.

![Carousel Builder](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.1-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### Core Functionality
- **13 Professional Layout Types**: Bold callouts, quote highlights, dictionary entries, raw anti-marketing hooks, stats showcases, and more
- **CSV-Powered Workflow**: Import carousel data from CSV files for bulk creation
- **Visual Editor**: Edit slides with an intuitive visual interface
- **Multi-Platform Export**: Export to Instagram (1080×1080), Instagram Story (1080×1920), LinkedIn (1080×1080), and Twitter (1200×675)
- **Multi-Carousel Management**: Handle multiple carousels in a single project with easy switching
- **Figma-Style Canvas**: Pan and zoom slide previews for precise editing

### Design Customization
- **Custom Layouts**: Create your own slide layouts with HTML/CSS using the built-in Monaco editor
- **Font Management**: Upload custom fonts or choose from Google Fonts library
- **Color Palettes**: Customize background, text, and accent colors for each slide
- **Template Library**: Start with pre-designed templates for common use cases

### Project Management
- **Dashboard**: Organize all your carousel projects in one place
- **Auto-Save**: Changes are automatically saved to browser localStorage
- **Bulk Operations**: Download all slides from a carousel at once
- **Search & Filter**: Quickly find projects with search functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or higher
- pnpm 9.x or higher

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/carousel-builder.git
cd carousel-builder
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open your browser to `http://localhost:3000`

### Production Build

Build for production:
```bash
pnpm build
```

The built files will be in the `dist/` directory.

## 📦 Deployment

### Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Netlify will automatically detect the `netlify.toml` configuration
4. Deploy! **No environment variables required.**

**Build Settings** (auto-detected from `netlify.toml`):
- Build command: `pnpm install && pnpm build`
- Publish directory: `dist`
- Node version: 22.13.0

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Other Platforms

The app is a static site and can be deployed to any static hosting service:

**Vercel:**
```bash
vercel --prod
```

**GitHub Pages:**
```bash
pnpm build
# Push dist/ to gh-pages branch
```

**Cloudflare Pages:**
- Build command: `pnpm build`
- Build output directory: `dist`

## 📖 Usage Guide

### Creating Your First Carousel

1. **Start a New Project**
   - Click "NEW PROJECT" on the dashboard
   - Give your project a name

2. **Choose Your Method**
   - **CSV Import**: Upload a CSV file with your carousel data
   - **Template**: Start with a pre-designed template
   - **Manual**: Add slides one by one with the visual editor

3. **Edit Slides**
   - Click "EDIT" on any slide to customize content
   - Change layout type, colors, fonts, and text
   - Reorder slides with drag-and-drop

4. **Export**
   - Select your export format (Instagram, Story, LinkedIn, Twitter)
   - Download individual slides or all slides at once

### CSV Format

Create carousels in bulk with CSV files. Here's the basic structure:

```csv
carousel_id,slide_number,layout_type,background_color,title,body_text,subtitle,quote,font_color,accent_color
my_carousel,1,bold_callout,#1A1A1A,,"Your Amazing Title",,,,#FFFFFF,#00D9FF
my_carousel,2,header_body,#FFFFFF,Key Points,"Point 1<br /><br />Point 2<br /><br />Point 3",,,,#1A1A1A,#00D9FF
```

**Available Layout Types:**
- `dictionary_entry` - Dictionary-style definition with pronunciation and etymology
- `minimalist_focus` - Clean headline plus supporting paragraph
- `bold_callout` - Centered, high-impact statements
- `header_body` - Classic header plus multi-paragraph body
- `quote_highlight` - Featured quote with attribution divider
- `list_layout` - Numbered or bulleted steps
- `stat_showcase` - Oversized statistics with context
- `split_content` - Title column paired with copy column
- `image_overlay` - Text overlay on full-bleed image
- `two_part_vertical` - Top/bottom split sections
- `anti_marketing_hook` - Brutalist hook with strapline and kicker
- `anti_marketing_content` - Editorial content block with accent ruler
- `anti_marketing_cta` - CTA card with heavy border, arrow, and action line

Download the [example CSV file](./client/public/examples/solenopsism.csv) to get started.

For detailed CSV formatting rules and multi-carousel examples, see [carousel_csv_generation_prompt.json](./carousel_csv_generation_prompt.json).

### Custom Layouts

Create your own slide layouts:

1. Go to **Settings** → **Custom Layouts**
2. Click **"NEW LAYOUT"**
3. Write HTML/CSS with template variables:
   - `{{title}}` - Slide title
   - `{{body_text}}` - Main body text
   - `{{subtitle}}` - Subtitle text
   - `{{quote}}` - Quote text
   - `{{background_color}}` - Background color
   - `{{font_color}}` - Text color
   - `{{accent_color}}` - Accent color
4. Preview and save

### Font Management

1. Go to **Settings** → **Fonts**
2. Choose fonts for:
   - **Heading Font**: Large titles and headlines
   - **Body Font**: Main body text
   - **Accent Font**: Labels and small text
3. Upload custom fonts (TTF, OTF, WOFF, WOFF2) or browse Google Fonts
4. Fonts apply globally to all slides

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Editor**: Monaco Editor (VS Code)
- **Rendering**: html2canvas for PNG export
- **Storage**: Browser localStorage (no backend required)
- **Routing**: Wouter (lightweight React router)

## 📁 Project Structure

```
carousel-builder/
├── client/                 # Frontend application (REMOVED in this template)
├── src/                    # Source files
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   ├── types/             # TypeScript types
│   └── const.ts           # Constants
├── public/                # Static assets
│   └── examples/          # Example CSV files
├── shared/                # Shared types/constants
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── index.html             # HTML entry point
```

## 🎨 Design System

The app uses a bold, modern design inspired by Dofinity:

- **Colors**: Coral (#FF6B5A), Sky Blue (#6B9FFF), Sage Green (#7FD957)
- **Typography**: Outfit (headings), Inter (body)
- **Spacing**: 4px base unit with consistent scale
- **Borders**: Bold 3px black borders throughout
- **Buttons**: Pill-shaped with arrow icons

## 🔧 Configuration

### No Environment Variables Required ✅

This app runs entirely in the browser with no backend. All data is stored in browser localStorage. **No API keys or environment variables are needed for deployment.**

### Customization

Edit `src/const.ts` to customize:
- App title and logo
- Default export presets
- Available layout types

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/yourusername/carousel-builder/issues) on GitHub.

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

*No backend required • Fully client-side • Privacy-focused*
