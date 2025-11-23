# Instagram Carousel Generator - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [User Flow](#user-flow)
4. [Site Architecture](#site-architecture)
5. [Data Flow](#data-flow)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Export System](#export-system)
9. [Template System](#template-system)
10. [CSV Processing](#csv-processing)
11. [Future Considerations](#future-considerations)

---

## System Overview

The Instagram Carousel Generator is a client-side web application built with React 19 that enables users to create professional social media carousels through three primary methods:

1. **CSV Upload**: Import carousel data from standardized CSV files
2. **Visual Editor**: Create and edit slides using a built-in WYSIWYG interface
3. **Templates**: Start from pre-designed carousel templates

The application supports multiple export formats (Instagram, LinkedIn, Twitter, Facebook, Pinterest) and provides real-time preview with drag-and-drop slide management.

### Core Capabilities
- **13 Layout Types**: Dictionary entry, minimalist focus, bold callout, header/body, quote highlight, list layout, stat showcase, split content, image overlay, two-part vertical, plus the Anti Marketing hook/content/cta sequence
- **Multi-Platform Export**: 6 social media platform presets with automatic dimension scaling
- **Visual CSV Editor**: Full CRUD operations on slides without external tools
- **Template Library**: 5 pre-designed carousel templates across different categories
- **Drag-and-Drop Reordering**: Intuitive slide sequence management

---

## Architecture

### Technology Stack

**Frontend Framework**
- React 19 (latest stable)
- TypeScript for type safety
- Wouter for lightweight routing

**Styling**
- Tailwind CSS 4 with custom design tokens
- shadcn/ui component library
- Custom fonts: Kyrios (Standard, Text) and Merriweather

**Key Libraries**
- `html2canvas`: Client-side PNG export
- `papaparse`: CSV parsing and generation
- `@hello-pangea/dnd`: Drag-and-drop functionality
- `sonner`: Toast notifications

**Build Tools**
- Vite for fast development and optimized builds
- pnpm for package management

### Application Type
Pure client-side single-page application (SPA) with no backend dependencies. All data processing, rendering, and export happens in the browser.

---

## User Flow

### Primary User Journeys

#### Journey 1: CSV Upload Workflow
```
1. User lands on home page
2. Clicks "Upload CSV File"
3. Selects CSV file from file system
4. System parses CSV and validates data
5. Carousels are loaded into the application
6. User navigates through slides using carousel controls
7. User selects export platform preset
8. User downloads individual slides or entire carousel
```

#### Journey 2: Template-Based Creation
```
1. User lands on home page
2. Clicks "Browse Templates"
3. Modal displays 5 template options
4. User selects a template (e.g., "Product Launch")
5. Template loads with placeholder content
6. User edits slides using visual editor
7. User customizes colors, text, and layout
8. User exports slides for chosen platform
```

#### Journey 3: Manual Creation
```
1. User uploads a minimal CSV or template
2. User clicks "+" button in slide sidebar
3. Slide editor modal opens
4. User fills in slide properties:
   - Slide number
   - Layout type
   - Colors (background, text, accent)
   - Content (title, body, subtitle, quote)
5. User saves slide
6. Slide appears in carousel
7. User reorders slides via drag-and-drop
8. User exports final carousel
```

### Navigation Patterns

**Home Page (No Carousels)**
- Large centered card with upload and template buttons
- Quick start instructions
- Example CSV download link

**Main Editor View (With Carousels)**
- Header: Carousel selector, export preset selector, action buttons
- Left Sidebar: Draggable slide list with edit/delete controls
- Center: Large slide preview (scaled to fit)
- Footer: Slide indicators, download buttons

---

## Site Architecture

### Route Structure
```
/ (Home)
  ├─ Empty State (no carousels)
  │  └─ Upload/Template selection
  └─ Editor State (carousels loaded)
     ├─ Slide List Sidebar
     ├─ Slide Preview
     └─ Export Controls
```

### Component Hierarchy
```
App
├── ThemeProvider
│   └── TooltipProvider
│       └── Router
│           └── Home
│               ├── FileInput (hidden)
│               ├── Header
│               │   ├── CarouselSelector
│               │   ├── ExportPresetSelector
│               │   └── ActionButtons
│               ├── SlideListSidebar
│               │   └── DragDropContext
│               │       └── Droppable
│               │           └── Draggable[] (slides)
│               ├── SlidePreview
│               │   ├── LayoutRenderer
│               │   └── NavigationArrows
│               ├── FooterControls
│               │   ├── SlideIndicators
│               │   └── DownloadButtons
│               ├── SlideEditor (Modal)
│               │   └── Dialog
│               │       └── Form Fields
│               └── TemplateSelector (Modal)
│                   └── Dialog
│                       └── Template Grid
```

### File Structure
```
client/
├── public/
│   ├── fonts/                    # Custom font files
│   │   ├── AT-KyriosStandard-*.otf
│   │   └── AT-KyriosText-*.otf
│   └── examples/                 # Example CSV files
│       ├── solenopsism.csv
│       ├── multi_carousel_example.csv
│       └── template.csv
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── input.tsx
│   │   │   └── textarea.tsx
│   │   ├── LayoutRenderer.tsx    # Renders all 13 layout types
│   │   └── SlideEditor.tsx       # Slide CRUD modal
│   ├── lib/
│   │   ├── csvParser.ts          # CSV parsing & validation
│   │   ├── carouselTemplates.ts  # Template definitions
│   │   └── exportPresets.ts      # Platform export configs
│   ├── types/
│   │   └── carousel.ts           # TypeScript interfaces
│   ├── pages/
│   │   ├── Home.tsx              # Main application page
│   │   └── NotFound.tsx          # 404 page
│   ├── contexts/
│   │   └── ThemeContext.tsx      # Theme management
│   ├── hooks/                    # Custom React hooks
│   ├── const.ts                  # App constants
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles & fonts
```

---

## Data Flow

### Data Models

#### SlideData Interface
```typescript
interface SlideData {
  carousel_id: string;           // Groups slides into carousels
  slide_number: number;          // Order within carousel
  layout_type: LayoutType;       // One of 13 layout types
  background_color: string;      // Hex color
  font_color: string;            // Hex color
  accent_color: string;          // Hex color
  title?: string;                // Optional main heading
  body_text?: string;            // Optional main content
  subtitle?: string;             // Optional secondary text
  quote?: string;                // Optional quote/etymology
  image_url?: string;            // Optional background image
}
```

#### CarouselData Interface
```typescript
interface CarouselData {
  id: string;                    // Unique carousel identifier
  slides: SlideData[];           // Array of slides
}
```

#### ExportPreset Interface
```typescript
interface ExportPreset {
  id: string;                    // Preset identifier
  name: string;                  // Display name
  platform: string;              // Platform name
  width: number;                 // Export width in pixels
  height: number;                // Export height in pixels
  aspectRatio: string;           // Display ratio
  description: string;           // Preset description
}
```

### State Flow

#### Application State (Home.tsx)
```typescript
const [carousels, setCarousels] = useState<CarouselData[]>([]);
const [selectedCarouselIndex, setSelectedCarouselIndex] = useState(0);
const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
const [exportPreset, setExportPreset] = useState<ExportPreset>(getDefaultPreset());
const [editorOpen, setEditorOpen] = useState(false);
const [editingSlide, setEditingSlide] = useState<SlideData | undefined>();
const [templatesOpen, setTemplatesOpen] = useState(false);
const [isExporting, setIsExporting] = useState(false);
```

#### State Transitions

**CSV Upload**
```
User selects file
  → FileReader reads file
  → parseCarouselCSV() processes content
  → Validation runs on each slide
  → setCarousels() updates state
  → UI re-renders with loaded carousels
```

**Slide Editing**
```
User clicks edit button
  → setEditingSlide(slide) stores current slide
  → setEditorOpen(true) shows modal
  → User modifies form fields
  → User clicks save
  → handleSaveSlide() updates carousel
  → setCarousels() triggers re-render
  → setEditorOpen(false) closes modal
```

**Slide Reordering**
```
User drags slide
  → @hello-pangea/dnd tracks movement
  → onDragEnd() fires with result
  → Array manipulation reorders slides
  → Slide numbers are recalculated
  → setCarousels() updates state
  → UI reflects new order
```

**Export**
```
User clicks download
  → setIsExporting(true) disables controls
  → html2canvas captures slideRef
  → Canvas converted to PNG data URL
  → Download link created and clicked
  → setIsExporting(false) re-enables controls
```

---

## Component Architecture

### LayoutRenderer Component

**Purpose**: Renders slides based on layout type

**Props**
```typescript
interface LayoutRendererProps {
  slide: SlideData;
}
```

**Layout Type Mapping**
```typescript
switch (slide.layout_type) {
  case 'dictionary_entry':    // Title, pronunciation, etymology, definition
  case 'minimalist_focus':    // Large title and body on solid background
  case 'bold_callout':        // Centered large text for impact
  case 'header_body':         // Simple title + body layout
  case 'quote_highlight':     // Large quote with attribution
  case 'list_layout':         // Title with bulleted/numbered list
  case 'stat_showcase':       // Large number with context
  case 'split_content':           // Two-column layout
  case 'image_overlay':           // Text over background image
  case 'two_part_vertical':       // Top/bottom sections
  case 'anti_marketing_hook':     // Brutalist hook with strapline and kicker
  case 'anti_marketing_content':  // Editorial block with accent rule
  case 'anti_marketing_cta':      // CTA card with arrow and underline
}
```

**Rendering Strategy**
- Each layout type has dedicated JSX structure
- Colors applied via inline styles for export compatibility
- Fonts applied via fontFamily CSS property
- Text parsing handles `<br />` tags for line breaks
- Responsive sizing based on export preset dimensions

### SlideEditor Component

**Purpose**: Modal for creating/editing slides

**Props**
```typescript
interface SlideEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (slide: SlideData) => void;
  slide?: SlideData;              // Undefined for new slides
  carouselId: string;
  nextSlideNumber: number;
}
```

**Form Fields**
- Slide number (number input)
- Layout type (dropdown select)
- Background color (color picker + text input)
- Font color (color picker + text input)
- Accent color (color picker + text input)
- Title (text input)
- Body text (textarea)
- Subtitle (text input)
- Quote (textarea)
- Image URL (text input)

**Validation**
- All color fields must be valid hex codes
- Slide number must be positive integer
- Layout type must be one of 13 valid types
- Required fields depend on layout type

---

## State Management

### Local State Pattern

The application uses React's built-in useState for all state management. No external state management library (Redux, Zustand, etc.) is used.

**Rationale**
- Single-page application with limited complexity
- State is localized to Home component
- No need for global state across routes
- Props drilling is minimal due to flat component hierarchy

### State Persistence

**Current Behavior**: No persistence. Refreshing the page clears all data.

**Workaround**: Users can export to CSV and re-import later.

**Future Enhancement**: localStorage or IndexedDB for auto-save functionality.

---

## Export System

### Export Process Flow

```
1. User selects export preset (platform + dimensions)
2. User clicks "Download Slide" or "Download All"
3. Application sets isExporting = true
4. For each slide to export:
   a. Ensure slide is rendered in DOM (via slideRef)
   b. Call html2canvas(slideRef.current, options)
   c. Canvas is created with 2x scale for quality
   d. Canvas converted to PNG data URL
   e. Download link created with filename
   f. Link clicked programmatically
   g. Wait 300ms before next slide (rate limiting)
5. Application sets isExporting = false
```

### Export Presets

**Instagram Square** (1080x1080)
- Default preset
- 1:1 aspect ratio
- Optimal for Instagram feed posts

**Instagram Story** (1080x1920)
- 9:16 aspect ratio
- Vertical format for Stories and Reels

**LinkedIn Post** (1200x1200)
- 1:1 aspect ratio
- Slightly larger than Instagram for quality

**Twitter Post** (1200x675)
- 16:9 aspect ratio
- Landscape format for Twitter/X

**Facebook Post** (1200x630)
- 1.91:1 aspect ratio
- Optimized for Facebook feed

**Pinterest Pin** (1000x1500)
- 2:3 aspect ratio
- Vertical format for Pinterest

### Export Quality Settings

```typescript
const canvasOptions = {
  scale: 2,                    // 2x resolution for retina displays
  backgroundColor: null,       // Transparent background
  logging: false,              // Disable console logs
  width: exportPreset.width,   // Target width
  height: exportPreset.height, // Target height
};
```

### Filename Convention

```
{carousel_id}-slide-{slide_number}-{preset_id}.png

Examples:
- solenopsism-slide-1-instagram-square.png
- product-launch-slide-3-twitter-post.png
```

---

## Template System

### Template Structure

Templates are defined in `client/src/lib/carouselTemplates.ts` as static data.

```typescript
interface CarouselTemplate {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Short description
  category: string;              // Category for grouping
  slides: Omit<SlideData, 'carousel_id'>[]; // Slide definitions
}
```

### Available Templates

**1. Product Launch** (Business)
- 5 slides
- Sequence: Bold intro → Problem → Solution → Features → CTA
- Color scheme: Dark, white, light blue, blue accent

**2. Educational Series** (Education)
- 5 slides
- Sequence: Title → Definition → Importance → Steps → Follow-up
- Color scheme: Warm yellows and oranges

**3. Quote Collection** (Inspiration)
- 5 slides
- Sequence: Title → Quote 1 → Quote 2 → Quote 3 → Engagement
- Color scheme: Pink and white

**4. Stats Showcase** (Business)
- 5 slides
- Sequence: Title → Stat 1 → Stat 2 → Stat 3 → CTA
- Color scheme: Green and white

**5. Brand Story** (Branding)
- 5 slides
- Sequence: Title → Origin → Mission → Values → CTA
- Color scheme: Purple and white

### Template Loading Process

```
1. User clicks "Browse Templates"
2. Modal displays all templates in grid
3. User clicks a template card
4. handleLoadTemplate(templateId) fires
5. Template data retrieved from CAROUSEL_TEMPLATES
6. New CarouselData object created
7. Template slides copied with carousel_id added
8. New carousel appended to carousels array
9. selectedCarouselIndex set to new carousel
10. Modal closes
11. User can now edit template content
```

### Template Customization

Users can customize templates by:
- Editing text content via SlideEditor
- Changing colors (background, font, accent)
- Reordering slides via drag-and-drop
- Adding or removing slides
- Changing layout types

---

## CSV Processing

### CSV Format Specification

**Required Columns**
- `carousel_id`: Groups slides into carousels
- `slide_number`: Numeric order (1, 2, 3...)
- `layout_type`: One of 13 valid layout types
- `background_color`: Hex color code
- `font_color`: Hex color code
- `accent_color`: Hex color code

**Optional Columns**
- `title`: Main heading text
- `body_text`: Main content text
- `subtitle`: Secondary text
- `quote`: Quote or etymology text
- `image_url`: Background image URL

### CSV Parsing Flow

```
1. User selects CSV file
2. FileReader reads file as text
3. parseCarouselCSV(csvContent) called
4. PapaParse parses CSV into array of objects
5. Rows grouped by carousel_id
6. Each group converted to CarouselData
7. Validation runs on each slide
8. Errors collected and displayed
9. Valid carousels returned
10. State updated with new carousels
```

### Validation Rules

**Slide Number**
- Must be positive integer
- No duplicate slide numbers within same carousel

**Layout Type**
- Must be one of: dictionary_entry, minimalist_focus, bold_callout, header_body, quote_highlight, list_layout, stat_showcase, split_content, image_overlay, two_part_vertical

**Colors**
- Must be valid hex codes (#RRGGBB or #RGB)
- Case insensitive

**Content Fields**
- No strict validation (can be empty)
- HTML tags in body_text are parsed for line breaks

### CSV Export

Users can export their carousels back to CSV format:

```
1. User clicks "Export CSV"
2. All carousels flattened to array of slide objects
3. PapaParse converts to CSV string
4. Blob created with CSV content
5. Download link created
6. File downloaded as "carousels-export.csv"
```

This allows users to:
- Save their work for later editing
- Share carousels with others
- Version control via CSV files
- Batch edit in spreadsheet software

---

## Future Considerations

### Scalability

**Current Limitations**
- All data stored in memory (no persistence)
- Large CSV files (1000+ slides) may cause performance issues
- No pagination or virtualization for slide lists

**Potential Solutions**
- Implement virtual scrolling for large slide lists
- Add localStorage/IndexedDB for persistence
- Lazy load slide previews
- Implement carousel pagination

### Performance Optimization

**Current Bottlenecks**
- html2canvas is synchronous and blocks UI during export
- Drag-and-drop re-renders entire slide list
- No memoization of LayoutRenderer

**Optimization Opportunities**
- Use React.memo for LayoutRenderer
- Implement Web Workers for export processing
- Add loading states and progress indicators
- Optimize re-render triggers with useCallback/useMemo

### Accessibility

**Current State**
- Basic keyboard navigation supported
- No ARIA labels on custom components
- Color contrast not validated

**Improvements Needed**
- Add ARIA labels to all interactive elements
- Implement keyboard shortcuts (e.g., arrow keys for navigation)
- Add focus management for modals
- Validate color contrast ratios
- Add alt text fields for slides

### Browser Compatibility

**Tested Browsers**
- Chrome/Edge (Chromium) - Full support
- Firefox - Full support
- Safari - Full support (with minor CSS differences)

**Known Issues**
- html2canvas may have rendering differences across browsers
- Custom fonts require proper CORS headers
- File downloads may behave differently on mobile

### Mobile Support

**Current State**
- Responsive design with Tailwind breakpoints
- Touch events supported for drag-and-drop
- Mobile file upload supported

**Limitations**
- Small screen makes slide editing challenging
- Export preview may be too small on mobile
- Drag-and-drop less intuitive on touch devices

**Recommendations**
- Consider mobile-specific UI for slide editor
- Add pinch-to-zoom for slide preview
- Implement swipe gestures for navigation

---

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Adding New Layout Types

1. Add new layout type to `LayoutType` union in `types/carousel.ts`
2. Add layout definition to `LAYOUT_TYPES` array in `SlideEditor.tsx`
3. Implement rendering logic in `LayoutRenderer.tsx` switch statement
4. Update validation in `csvParser.ts`
5. Document layout in `LAYOUT_TYPES.md`
6. Add example to template CSV files

### Adding New Export Presets

1. Add preset definition to `EXPORT_PRESETS` array in `exportPresets.ts`
2. Test export with different layout types
3. Verify aspect ratio scaling
4. Update README documentation

### Adding New Templates

1. Define template in `carouselTemplates.ts`
2. Include 3-5 slides with placeholder content
3. Choose cohesive color scheme
4. Test template loading and editing
5. Add template to documentation

---

## Deployment

### Build Output

```
dist/
├── index.html              # Entry point
├── assets/
│   ├── index-[hash].js     # Bundled JavaScript
│   ├── index-[hash].css    # Bundled CSS
│   └── fonts/              # Font files
└── examples/               # Example CSV files
```

### Environment Variables

No environment variables required. Application is fully client-side.

### Hosting Recommendations

**Static Hosting Platforms**
- Vercel (recommended)
- Netlify
- GitHub Pages
- Cloudflare Pages

**Configuration**
- Build command: `pnpm build`
- Output directory: `dist`
- Node version: 22.x

### CDN Considerations

- Font files should be served with proper CORS headers
- Example CSV files should be accessible
- Assets are content-hashed for cache busting

---

## Conclusion

The Instagram Carousel Generator is a well-architected client-side application that balances simplicity with powerful features. The modular component structure, clear data flow, and comprehensive type safety make it maintainable and extensible. Future enhancements should focus on performance optimization, accessibility improvements, and user experience refinements while maintaining the current architectural simplicity.
