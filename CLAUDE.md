# Social Post Helper - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [User Flow](#user-flow)
4. [Application Structure](#application-structure)
5. [Data Flow & State Management](#data-flow--state-management)
6. [Component Architecture](#component-architecture)
7. [Storage System](#storage-system)
8. [Custom Layout System](#custom-layout-system)
9. [Font Management System](#font-management-system)
10. [Export System](#export-system)
11. [Template System](#template-system)
12. [CSV Processing](#csv-processing)
13. [Development Guide](#development-guide)

---

## System Overview

The Social Post Helper is a **multi-page client-side web application** built with React 18 that enables users to create professional social media carousels through a comprehensive project management interface. The application has evolved far beyond a simple carousel generator into a sophisticated design platform.

### Core Features

**Project Management**
- Create, rename, duplicate, and delete projects
- Each project contains multiple carousels with metadata
- Grid/list view toggle with search functionality
- localStorage persistence with auto-save

**13 Built-in Layout Types + Custom Layouts**
- Dictionary entry, minimalist focus, bold callout, header/body
- Quote highlight, list layout, stat showcase, split content
- Image overlay, two-part vertical
- Anti-marketing layouts (hook, content, CTA)
- **User-created custom layouts** with HTML/CSS editor

**Font Management**
- Upload custom fonts (TTF, OTF, WOFF, WOFF2)
- Google Fonts integration with 1000+ font families
- Separate font settings for heading, body, and accent text
- Base64 encoding for localStorage storage

**Multi-Platform Export**
- 6 social media platform presets (Instagram, LinkedIn, Twitter, Facebook, Pinterest, Story)
- Bulk ZIP download of entire carousels
- High-quality PNG export at 2x resolution
- Automatic dimension scaling

**Advanced Editing**
- Drag-and-drop slide reordering
- CSV import/export for batch editing
- Visual slide editor with live preview
- Pan/zoom canvas for navigation
- Template library with 6 pre-designed carousels

### Target Platforms
- **Desktop only** - Mobile users see a warning screen
- Chrome/Edge (Chromium), Firefox, Safari supported
- Requires JavaScript enabled

---

## Architecture

### Technology Stack

**Frontend Framework**
- React 18.3.1 (not 19 as previously documented)
- TypeScript 5.6.3 with strict mode
- Wouter 3.3.5 for lightweight routing

**UI Framework**
- Tailwind CSS 4.1.14 with custom design system
- shadcn/ui component library (20+ Radix UI components)
- class-variance-authority for variant styling
- Dofinity design system with custom tokens

**Key Libraries**
- `html2canvas` 1.4.1: Client-side PNG export
- `papaparse` 5.5.3: CSV parsing and generation
- `@hello-pangea/dnd` 18.0.1: Drag-and-drop functionality
- `sonner` 2.0.7: Toast notifications
- `jszip` 3.10.1: Bulk carousel downloads
- `@monaco-editor/react` 4.7.0: VS Code-style code editor
- `nanoid` 5.1.5: ID generation
- `axios` 1.12.2: HTTP client for Google Fonts API

**Build Tools**
- Vite 7.1.7: Fast dev server and bundler
- @tailwindcss/vite 4.1.3: Tailwind CSS v4 integration
- pnpm: Package management

**Development Tools**
- ESLint with TypeScript rules
- Prettier for code formatting
- TypeScript path aliases (@/, @shared/, @assets/)

### Application Architecture

**Type**: Multi-page application (MPA) with client-side routing

**Deployment**: Static hosting (Vercel, Netlify, etc.)

**Data Persistence**: localStorage for all data (projects, custom layouts, fonts, settings)

**Platform Integration**: Manus runtime for deployment platform features

---

## User Flow

### Journey 1: New User Onboarding
```
1. User visits site → Redirected to /dashboard
2. Empty state shows "Create your first project"
3. User clicks "New Project" button
4. Modal prompts for project name
5. Project created → Redirected to /editor/{projectId}
6. Editor shows empty carousel
7. User chooses: Upload CSV, Browse Templates, or Create Manually
8. User edits slides and exports
```

### Journey 2: Template-Based Creation
```
1. User on Dashboard clicks "New Project"
2. Names project (e.g., "Summer Campaign")
3. In Editor, clicks "Browse Templates"
4. Modal displays 6 template options
5. User selects "Anti-Marketing Hook"
6. Template loads with 3 pre-designed slides
7. User edits text, colors, and layout
8. User exports slides for Instagram
9. Downloads ZIP with all slides
```

### Journey 3: CSV Import Workflow
```
1. User creates CSV file with carousel data
2. Opens existing project or creates new one
3. In Editor, clicks "Upload CSV"
4. Selects CSV file from file system
5. System validates and parses CSV
6. Carousels appear in carousel selector
7. User navigates through slides
8. User adjusts colors and text via SlideEditor
9. User exports to multiple platforms
```

### Journey 4: Custom Layout Creation
```
1. User navigates to /settings
2. Clicks "Custom Layouts" tab
3. Clicks "Create New Layout"
4. Names layout (e.g., "Product Showcase")
5. Writes HTML template with variables: {{title}}, {{body_text}}, etc.
6. Writes CSS styles in separate editor
7. Previews layout with sample data
8. Saves layout
9. Layout appears in SlideEditor layout selector
10. User can now use custom layout in any slide
```

### Journey 5: Font Customization
```
1. User navigates to /settings
2. Clicks "Fonts" tab
3. Chooses to upload custom font or browse Google Fonts
4. If Google Fonts: searches "Poppins", previews, adds
5. If custom: uploads TTF file, names it "Brand Font"
6. In Font Settings section, assigns:
   - Heading: Brand Font
   - Body: Poppins
   - Accent: Inter
7. Returns to Editor
8. All slides now use new fonts
```

---

## Application Structure

### Route Structure
```
/ (Root)
  └─> Redirects to /dashboard

/dashboard
  ├─ Empty State (no projects)
  │  └─ "Create your first project" CTA
  └─ Projects View (has projects)
     ├─ Header with search and view toggle
     ├─ Grid/List of project cards
     └─ New Project button

/editor/:projectId
  ├─ Header
  │  ├─ Back to Dashboard button
  │  ├─ Project name display
  │  ├─ Carousel selector dropdown
  │  ├─ Export preset selector
  │  └─ Action buttons (Upload CSV, Templates, Export CSV)
  ├─ Slide List Sidebar
  │  ├─ Add Slide button
  │  └─ Draggable slide thumbnails with edit/delete
  ├─ Main Canvas
  │  ├─ PanZoomCanvas wrapper
  │  └─ LayoutRenderer (current slide)
  ├─ Slide Navigation
  │  ├─ Previous/Next arrows
  │  └─ Slide indicators (dots)
  └─ Export Controls
     ├─ Download Slide button
     └─ Download All (ZIP) button

/settings
  ├─ Tabs
  │  ├─ Custom Layouts
  │  └─ Fonts
  ├─ Custom Layouts Tab
  │  ├─ Layout list with edit/delete
  │  ├─ Create New Layout button
  │  └─ Monaco code editor (HTML + CSS)
  └─ Fonts Tab
     ├─ Google Fonts browser
     ├─ Custom font uploader
     └─ Font settings (heading, body, accent)

/404
  └─ Not Found page with back to dashboard link
```

### File Structure (Actual)
```
client/
├── src/
│   ├── components/
│   │   ├── ui/                      # 50+ shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (many more)
│   │   ├── ErrorBoundary.tsx        # React error boundary
│   │   ├── LayoutRenderer.tsx       # Renders all layout types (974 lines)
│   │   ├── SlideEditor.tsx          # Slide CRUD modal
│   │   ├── PanZoomCanvas.tsx        # Canvas with pan/zoom
│   │   ├── MobileWarning.tsx        # Desktop-only enforcement
│   │   ├── FontsSettings.tsx        # Font management UI
│   │   └── CustomLayoutEditor.tsx   # Monaco editor wrapper
│   ├── pages/
│   │   ├── Dashboard.tsx            # Project management (524 lines)
│   │   ├── Editor.tsx               # Main carousel editor (869 lines)
│   │   ├── Settings.tsx             # Settings page (518 lines)
│   │   ├── NotFound.tsx             # 404 page
│   │   └── Home.tsx                 # Redirect to dashboard
│   ├── lib/
│   │   ├── csvParser.ts             # CSV parsing & validation
│   │   ├── carouselTemplates.ts     # 6 template definitions
│   │   ├── exportPresets.ts         # Platform export configs
│   │   ├── projectStorage.ts        # Project CRUD operations
│   │   ├── layoutStorage.ts         # Custom layout storage
│   │   ├── fontStorage.ts           # Font management storage
│   │   ├── googleFonts.ts           # Google Fonts API integration
│   │   ├── storageUtils.ts          # Storage quota checking
│   │   ├── exportUtils.ts           # Export helper functions
│   │   ├── utils.ts                 # General utilities
│   │   └── constants.ts             # App-wide constants
│   ├── types/
│   │   ├── carousel.ts              # Carousel & slide types
│   │   ├── project.ts               # Project types
│   │   ├── customLayout.ts          # Custom layout types
│   │   └── font.ts                  # Font types
│   ├── contexts/
│   │   └── ThemeContext.tsx         # Dark/light theme
│   ├── hooks/
│   │   ├── useMobile.ts             # Mobile detection
│   │   ├── usePersistFn.ts          # Persistent function refs
│   │   └── useComposition.ts        # Input composition
│   ├── App.tsx                      # Root component with routing
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Global styles & Tailwind
│   ├── dofinity-bold.css            # Dofinity design system
│   ├── design-system.css            # Design tokens
│   └── platform-design.css          # Platform-specific styles
├── public/
│   └── examples/                    # Example CSV files
│       ├── solenopsism.csv
│       ├── multi_carousel_example.csv
│       └── template.csv
├── fonts/                           # Custom font files
│   ├── AT-KyriosStandard-*.otf
│   └── AT-KyriosText-*.otf
├── vite.config.ts                   # Vite configuration
├── tailwind.config.ts               # Tailwind CSS config
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies
```

---

## Data Flow & State Management

### Data Models

#### Project Interface
```typescript
interface Project {
  id: string;                  // Unique project ID (nanoid)
  name: string;                // User-defined name
  carousels: CarouselData[];   // Array of carousels
  createdAt: number;           // Timestamp
  updatedAt: number;           // Timestamp
  color?: string;              // Project accent color
}
```

#### CarouselData Interface
```typescript
interface CarouselData {
  id: string;                  // Unique carousel ID
  slides: SlideData[];         // Array of slides
}
```

#### SlideData Interface
```typescript
interface SlideData {
  carousel_id: string;         // Parent carousel ID
  slide_number: number;        // Order within carousel (1-based)
  layout_type: LayoutType | string; // Layout identifier
  background_color: string;    // Hex color
  font_color: string;          // Hex color
  accent_color: string;        // Hex color
  title?: string;              // Optional heading
  body_text?: string;          // Optional main content
  subtitle?: string;           // Optional subheading
  quote?: string;              // Optional quote/callout
  image_url?: string;          // Optional background image
}
```

#### CustomLayout Interface
```typescript
interface CustomLayout {
  id: string;                  // Unique layout ID
  name: string;                // Display name
  htmlTemplate: string;        // HTML with {{variables}}
  cssTemplate: string;         // CSS styles
  description?: string;        // Optional description
  createdAt: number;           // Timestamp
}
```

#### FontSettings Interface
```typescript
interface FontSettings {
  heading: string;             // Font family for headings
  body: string;                // Font family for body text
  accent: string;              // Font family for accents
}
```

### State Management

**Architecture**: Local state with React hooks (no Redux/Zustand)

**Persistence**: localStorage with auto-save

**State Locations**:
- **Dashboard.tsx**: Project list, search, view mode
- **Editor.tsx**: Current project, carousel selection, slide navigation
- **Settings.tsx**: Custom layouts, fonts, Google Fonts search
- **ThemeContext**: Dark/light mode preference

#### Editor State (Editor.tsx)
```typescript
const [project, setProject] = useState<Project | null>(null);
const [selectedCarouselIndex, setSelectedCarouselIndex] = useState(0);
const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
const [exportPreset, setExportPreset] = useState<ExportPreset>(getDefaultPreset());
const [editorOpen, setEditorOpen] = useState(false);
const [editingSlide, setEditingSlide] = useState<SlideData | undefined>();
const [templatesOpen, setTemplatesOpen] = useState(false);
const [isExporting, setIsExporting] = useState(false);
```

#### Storage Keys
```typescript
const STORAGE_KEYS = {
  PROJECTS: 'carousel_projects',
  CUSTOM_LAYOUTS: 'custom_layouts',
  CUSTOM_FONTS: 'custom_fonts',
  FONT_SETTINGS: 'font_settings',
  THEME: 'theme_preference'
};
```

### Data Flow Patterns

#### Project Creation Flow
```
User clicks "New Project"
  → Dashboard shows name input modal
  → User enters name
  → generateId() creates unique ID
  → New Project object created with empty carousels array
  → saveProject() writes to localStorage
  → Navigate to /editor/{projectId}
  → Editor loads project from localStorage
```

#### Auto-Save Flow
```
User edits slide in Editor
  → handleSaveSlide() updates slide in carousel
  → setProject() triggers re-render
  → useEffect() watches project changes
  → saveProject() debounced write to localStorage
  → Toast notification: "Project saved"
```

#### Export Flow
```
User clicks "Download All"
  → setIsExporting(true) shows loading state
  → For each slide:
    → html2canvas captures slideRef
    → Canvas converted to PNG blob
    → Add blob to JSZip instance
  → Generate ZIP file
  → Create download link
  → Click link programmatically
  → setIsExporting(false) hides loading
  → Toast: "Carousel exported successfully"
```

---

## Component Architecture

### Core Components

#### LayoutRenderer.tsx (974 lines)
**Purpose**: Renders slides based on layout type with font settings

**Key Features**:
- Renders 13 built-in layout types
- Renders custom layouts with template variable substitution
- Applies font settings from fontStorage
- Handles image overlays and background colors
- Exports at correct dimensions based on preset

**Layout Type Switching**:
```typescript
switch (slide.layout_type) {
  case 'dictionary_entry':
    return <DictionaryEntry slide={slide} fonts={fonts} />;
  case 'minimalist_focus':
    return <MinimalistFocus slide={slide} fonts={fonts} />;
  // ... 11 more built-in layouts
  default:
    // Custom layout (format: "custom-{id}")
    if (slide.layout_type.startsWith('custom-')) {
      return <CustomLayoutRenderer slide={slide} layoutId={layoutId} />;
    }
}
```

**Template Variable Substitution**:
```typescript
const renderCustomLayout = (layout: CustomLayout, slide: SlideData) => {
  let html = layout.htmlTemplate;
  html = html.replace(/\{\{title\}\}/g, slide.title || '');
  html = html.replace(/\{\{body_text\}\}/g, slide.body_text || '');
  html = html.replace(/\{\{subtitle\}\}/g, slide.subtitle || '');
  html = html.replace(/\{\{quote\}\}/g, slide.quote || '');
  // ... more replacements
  return html;
};
```

**Performance Consideration**: Should use React.memo to prevent unnecessary re-renders

#### SlideEditor.tsx
**Purpose**: Modal for creating/editing slides with all layout types

**Features**:
- Form with all slide properties
- Color pickers with hex input validation
- Layout type selector (includes custom layouts dynamically)
- Live validation and error messages
- Supports both create and edit modes

**Layout Type Selector**:
```typescript
const layoutOptions = [
  ...BUILT_IN_LAYOUTS,
  ...getCustomLayouts().map(l => ({
    id: `custom-${l.id}`,
    name: l.name
  }))
];
```

#### PanZoomCanvas.tsx
**Purpose**: Wrapper for slide preview with pan/zoom functionality

**Features**:
- Mouse drag to pan
- Scroll wheel to zoom
- Reset view button
- Maintains aspect ratio
- Performance optimized with requestAnimationFrame

**Usage**:
```typescript
<PanZoomCanvas>
  <LayoutRenderer slide={currentSlide} exportPreset={exportPreset} />
</PanZoomCanvas>
```

#### FontsSettings.tsx (14KB)
**Purpose**: Comprehensive font management interface

**Features**:
- Google Fonts API integration with search
- Custom font upload (drag-and-drop)
- Font preview with sample text
- Font settings for heading/body/accent
- Base64 encoding for localStorage
- Error handling for API failures

**Google Fonts Integration**:
```typescript
const searchGoogleFonts = async (query: string) => {
  const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
  const response = await axios.get(
    `https://www.googleapis.com/webfonts/v1/webfonts`,
    { params: { key: apiKey, sort: 'popularity' } }
  );
  return response.data.items.filter(font =>
    font.family.toLowerCase().includes(query.toLowerCase())
  );
};
```

#### CustomLayoutEditor.tsx
**Purpose**: Monaco editor for HTML/CSS editing

**Features**:
- Syntax highlighting for HTML and CSS
- Auto-completion
- Error highlighting
- Live preview with sample data
- Import/export layouts as JSON

**Template Variables**:
```
{{title}}          - Slide title
{{body_text}}      - Main content
{{subtitle}}       - Subheading
{{quote}}          - Quote text
{{image_url}}      - Background image
{{background_color}} - Background color
{{font_color}}     - Text color
{{accent_color}}   - Accent color
```

### Page Components

#### Dashboard.tsx (524 lines)
**Purpose**: Project management interface

**Features**:
- Grid/list view toggle
- Search projects by name
- Create new project modal
- Rename project inline editing
- Duplicate project
- Delete with confirmation
- Empty state with onboarding
- Mobile detection with warning

**State**:
```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [isCreating, setIsCreating] = useState(false);
```

#### Editor.tsx (869 lines)
**Purpose**: Main carousel editing interface

**Features**:
- CSV upload/download
- Template selector modal
- Drag-and-drop slide reordering
- Slide editor modal
- Export preset selector
- Bulk export with JSZip
- Auto-save on changes
- Keyboard navigation (arrow keys)

**Key Functions**:
```typescript
const handleCSVUpload = (file: File) => { /* ... */ };
const handleLoadTemplate = (templateId: string) => { /* ... */ };
const handleSlideReorder = (result: DropResult) => { /* ... */ };
const handleDownloadSlide = () => { /* ... */ };
const handleDownloadAll = () => { /* ... */ };
```

#### Settings.tsx (518 lines)
**Purpose**: Application settings and customization

**Features**:
- Tabbed interface (Custom Layouts | Fonts)
- Custom layout CRUD operations
- Monaco code editor integration
- Google Fonts browser
- Custom font upload
- Font settings management
- Import/export layouts

**Tabs**:
```typescript
<Tabs defaultValue="layouts">
  <TabsList>
    <TabsTrigger value="layouts">Custom Layouts</TabsTrigger>
    <TabsTrigger value="fonts">Fonts</TabsTrigger>
  </TabsList>
  <TabsContent value="layouts">
    <CustomLayoutEditor />
  </TabsContent>
  <TabsContent value="fonts">
    <FontsSettings />
  </TabsContent>
</Tabs>
```

---

## Storage System

### Architecture

**Storage Backend**: localStorage (browser API)

**Quota**: ~5-10MB depending on browser (no checking currently implemented)

**Serialization**: JSON with base64 encoding for binary data (fonts)

**Error Handling**: Try-catch blocks with fallback to default values

### Storage Modules

#### projectStorage.ts
```typescript
export function getAllProjects(): Project[] {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}

export function saveProject(project: Project): void {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = { ...project, updatedAt: Date.now() };
  } else {
    projects.push({ ...project, createdAt: Date.now(), updatedAt: Date.now() });
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getAllProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}
```

#### layoutStorage.ts
```typescript
export function getCustomLayouts(): CustomLayout[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_LAYOUTS);
  return data ? JSON.parse(data) : [];
}

export function saveCustomLayout(layout: CustomLayout): void {
  const layouts = getCustomLayouts();
  layouts.push(layout);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(layouts));
}

export function updateCustomLayout(id: string, updates: Partial<CustomLayout>): void {
  const layouts = getCustomLayouts();
  const index = layouts.findIndex(l => l.id === id);
  if (index >= 0) {
    layouts[index] = { ...layouts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(layouts));
  }
}

export function deleteCustomLayout(id: string): void {
  const layouts = getCustomLayouts().filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(layouts));
}
```

#### fontStorage.ts
```typescript
export function getCustomFonts(): CustomFont[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_FONTS);
  return data ? JSON.parse(data) : [];
}

export function saveCustomFont(font: CustomFont): void {
  const fonts = getCustomFonts();
  fonts.push(font);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_FONTS, JSON.stringify(fonts));
}

export function getFontSettings(): FontSettings {
  const data = localStorage.getItem(STORAGE_KEYS.FONT_SETTINGS);
  return data ? JSON.parse(data) : {
    heading: 'AT-Kyrios Standard',
    body: 'AT-Kyrios Text',
    accent: 'Merriweather'
  };
}

export function saveFontSettings(settings: FontSettings): void {
  localStorage.setItem(STORAGE_KEYS.FONT_SETTINGS, JSON.stringify(settings));
}
```

### Storage Limitations

**Current Issues**:
1. ❌ No quota checking before saving
2. ❌ Custom fonts stored as base64 (inefficient)
3. ❌ No compression for large datasets
4. ❌ No error recovery if quota exceeded

**Recommendations**:
1. ✅ Implement quota checking (see Phase 1 tasks)
2. ✅ Warn users when approaching limit
3. ✅ Compress JSON data with LZ-string
4. ✅ Consider IndexedDB for large fonts

---

## Custom Layout System

### Overview

The custom layout system allows users to create their own slide layouts using HTML and CSS templates with variable substitution.

### Layout Template Format

**HTML Template**:
```html
<div class="custom-layout">
  <h1 class="title">{{title}}</h1>
  <p class="body">{{body_text}}</p>
  <div class="accent-bar" style="background: {{accent_color}}"></div>
</div>
```

**CSS Template**:
```css
.custom-layout {
  background: {{background_color}};
  color: {{font_color}};
  padding: 40px;
  font-family: {{heading_font}};
}

.title {
  font-size: 48px;
  margin-bottom: 20px;
}

.body {
  font-size: 24px;
  line-height: 1.5;
}

.accent-bar {
  width: 100%;
  height: 4px;
  margin-top: 20px;
}
```

### Available Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{title}}` | Slide title | "Welcome to Our Product" |
| `{{body_text}}` | Main content | "This is the main content..." |
| `{{subtitle}}` | Subheading | "A brief description" |
| `{{quote}}` | Quote text | "The best product ever" |
| `{{image_url}}` | Background image URL | "https://..." |
| `{{background_color}}` | Background hex color | "#1a1a1a" |
| `{{font_color}}` | Text hex color | "#ffffff" |
| `{{accent_color}}` | Accent hex color | "#3b82f6" |
| `{{heading_font}}` | Font family for headings | "Poppins, sans-serif" |
| `{{body_font}}` | Font family for body | "Inter, sans-serif" |
| `{{accent_font}}` | Font family for accents | "Merriweather, serif" |

### Security Considerations

**XSS Risk**: Custom layouts use `dangerouslySetInnerHTML`

**Current Implementation** (UNSAFE):
```typescript
<div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
```

**Recommended Fix**: Sanitize with DOMPurify
```typescript
import DOMPurify from 'isomorphic-dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(renderedHTML, {
    ALLOWED_TAGS: ['div', 'p', 'h1', 'h2', 'h3', 'span', 'img'],
    ALLOWED_ATTR: ['class', 'style', 'src', 'alt']
  })
}} />
```

### Import/Export

**Export Format** (JSON):
```json
{
  "id": "layout-abc123",
  "name": "Product Showcase",
  "htmlTemplate": "<div>...</div>",
  "cssTemplate": ".custom-layout { ... }",
  "description": "A layout for showcasing products",
  "createdAt": 1234567890
}
```

Users can export layouts as JSON files and share them with others or use as backups.

---

## Font Management System

### Architecture

The font management system supports two sources:
1. **Google Fonts API**: 1000+ font families
2. **Custom Fonts**: User-uploaded font files

### Google Fonts Integration

**API Endpoint**: `https://www.googleapis.com/webfonts/v1/webfonts`

**API Key**: Stored in environment variable `VITE_GOOGLE_FONTS_API_KEY`

**Current Issue**: Placeholder key in source code (needs migration to .env)

**Search Flow**:
```
User types "Poppins" in search
  → searchGoogleFonts('Poppins') called
  → Axios GET request to Google Fonts API
  → Filter results by query
  → Display font cards with preview
  → User clicks "Add Font"
  → Font added to available fonts
  → Font appears in font settings dropdowns
```

**Font Loading**:
```typescript
// Dynamically load Google Font
const loadGoogleFont = (fontFamily: string) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;700&display=swap`;
  document.head.appendChild(link);
};
```

### Custom Font Upload

**Supported Formats**: TTF, OTF, WOFF, WOFF2

**Upload Flow**:
```
User selects font file
  → FileReader reads file as ArrayBuffer
  → Convert to base64 string
  → Create CustomFont object
  → Save to localStorage
  → Generate @font-face CSS
  → Inject CSS into document
  → Font available for use
```

**Font Object**:
```typescript
interface CustomFont {
  id: string;
  name: string;
  family: string;
  data: string;        // Base64-encoded font file
  format: string;      // 'truetype', 'opentype', 'woff', 'woff2'
  createdAt: number;
}
```

**@font-face Generation**:
```typescript
const generateFontFace = (font: CustomFont) => {
  return `
    @font-face {
      font-family: '${font.family}';
      src: url(data:font/${font.format};base64,${font.data}) format('${font.format}');
      font-weight: normal;
      font-style: normal;
    }
  `;
};
```

### Font Settings

Users configure three font categories:

1. **Heading Font**: Used for slide titles (h1, h2)
2. **Body Font**: Used for main content (p, div)
3. **Accent Font**: Used for quotes, callouts, special text

**Settings Storage**:
```typescript
{
  "heading": "Poppins",
  "body": "Inter",
  "accent": "Merriweather"
}
```

**Application**:
```typescript
// In LayoutRenderer
const fonts = getFontSettings();

<h1 style={{ fontFamily: fonts.heading }}>
  {slide.title}
</h1>
<p style={{ fontFamily: fonts.body }}>
  {slide.body_text}
</p>
```

### Storage Concerns

**Issue**: Base64-encoded fonts can be very large (200KB - 2MB per font)

**Example**:
- Poppins Regular TTF: ~180KB → ~240KB base64
- Multiple fonts quickly fill localStorage (5-10MB limit)

**Recommendation**:
- Implement quota checking
- Warn users before uploading large fonts
- Consider IndexedDB for font storage
- Provide font optimization tips

---

## Export System

### Export Presets

**6 Platform Presets**:

| Preset | Dimensions | Aspect Ratio | Platform |
|--------|-----------|--------------|----------|
| Instagram Square | 1080x1080 | 1:1 | Instagram Feed |
| Instagram Story | 1080x1920 | 9:16 | Stories/Reels |
| LinkedIn Post | 1200x1200 | 1:1 | LinkedIn |
| Twitter Post | 1200x675 | 16:9 | Twitter/X |
| Facebook Post | 1200x630 | 1.91:1 | Facebook |
| Pinterest Pin | 1000x1500 | 2:3 | Pinterest |

### Export Process

**Single Slide Export**:
```
1. User clicks "Download Slide"
2. setIsExporting(true) disables UI
3. html2canvas captures slideRef with options:
   - scale: 2 (2x resolution)
   - width: exportPreset.width
   - height: exportPreset.height
4. Canvas converted to PNG blob
5. Create download link with filename
6. Click link programmatically
7. setIsExporting(false) enables UI
8. Toast: "Slide downloaded"
```

**Bulk Export (All Slides)**:
```
1. User clicks "Download All"
2. Create new JSZip instance
3. For each slide in carousel:
   a. Render slide
   b. Capture with html2canvas
   c. Convert to blob
   d. Add to zip: zip.file(`slide-${n}.png`, blob)
   e. Wait 300ms (rate limiting)
4. Generate zip file: zip.generateAsync()
5. Create download link
6. Click link: `{carousel_id}-{preset_id}.zip`
7. Toast: "Carousel exported"
```

### Export Configuration

**html2canvas Options**:
```typescript
const exportOptions = {
  scale: 2,                      // 2x for retina displays
  backgroundColor: null,         // Transparent background
  logging: false,                // Disable console logs
  width: exportPreset.width,
  height: exportPreset.height,
  useCORS: true,                 // Allow cross-origin images
  allowTaint: false,             // Security
  windowWidth: exportPreset.width,
  windowHeight: exportPreset.height
};
```

### Filename Convention

**Single Slide**:
```
{carousel_id}-slide-{slide_number}-{preset_id}.png

Example: product-launch-slide-1-instagram-square.png
```

**Bulk ZIP**:
```
{carousel_id}-{preset_id}.zip

Example: product-launch-instagram-square.zip
```

### Performance Issues

**Current Bottleneck**: html2canvas is synchronous and blocks main thread

**Impact**:
- UI freezes during export
- Large carousels (10+ slides) cause noticeable lag
- Browser may show "page unresponsive" warning

**Recommended Solution**: Web Workers
```typescript
// exportWorker.ts
self.onmessage = async (e) => {
  const { slideHTML, options } = e.data;
  const canvas = await html2canvas(slideHTML, options);
  const blob = await canvas.toBlob();
  self.postMessage({ blob });
};

// Editor.tsx
const worker = new Worker(new URL('./exportWorker.ts', import.meta.url));
worker.postMessage({ slideHTML, options });
worker.onmessage = (e) => {
  downloadBlob(e.data.blob);
};
```

---

## Template System

### Available Templates

**6 Pre-designed Templates**:

1. **Anti-Marketing Hook** (Anti-Marketing)
   - 3 slides
   - Brutalist design with bold typography
   - Sequence: Hook → Content → CTA
   - Color scheme: Black, white, red accent

2. **Product Launch** (Business)
   - 5 slides
   - Professional corporate style
   - Sequence: Intro → Problem → Solution → Features → CTA
   - Color scheme: Dark blue, white, light blue

3. **Educational Series** (Education)
   - 5 slides
   - Clean, readable layout
   - Sequence: Title → Definition → Importance → Steps → Follow-up
   - Color scheme: Warm yellow and orange

4. **Quote Collection** (Inspiration)
   - 5 slides
   - Minimalist quote layouts
   - Sequence: Title → Quote 1 → Quote 2 → Quote 3 → Engagement
   - Color scheme: Pink and white

5. **Stats Showcase** (Business)
   - 5 slides
   - Large numbers with context
   - Sequence: Title → Stat 1 → Stat 2 → Stat 3 → CTA
   - Color scheme: Green and white

6. **Brand Story** (Branding)
   - 5 slides
   - Storytelling layouts
   - Sequence: Title → Origin → Mission → Values → CTA
   - Color scheme: Purple and white

### Template Loading

**Template Structure**:
```typescript
interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  slides: Omit<SlideData, 'carousel_id'>[];
}
```

**Loading Process**:
```
1. User in Editor clicks "Browse Templates"
2. Modal displays template grid with previews
3. User clicks template card
4. handleLoadTemplate(templateId) fires
5. Template retrieved from CAROUSEL_TEMPLATES
6. New carousel created with nanoid()
7. Slides copied with carousel_id assigned
8. Carousel added to project.carousels array
9. selectedCarouselIndex set to new carousel
10. Auto-save triggered
11. Modal closes
12. User can now edit template
```

### Template Customization

Users can fully customize templates:
- Edit all text content
- Change all colors
- Modify layout types
- Add/remove slides
- Reorder slides
- Export to CSV for future use

---

## CSV Processing

### CSV Format Specification

**Required Columns**:
```
carousel_id, slide_number, layout_type,
background_color, font_color, accent_color
```

**Optional Columns**:
```
title, body_text, subtitle, quote, image_url
```

**Example CSV**:
```csv
carousel_id,slide_number,layout_type,background_color,font_color,accent_color,title,body_text
product-launch,1,bold_callout,#1a1a1a,#ffffff,#3b82f6,Welcome,Our new product is here
product-launch,2,header_body,#ffffff,#1a1a1a,#3b82f6,Features,Check out these amazing features
```

### CSV Import Flow

```
1. User clicks "Upload CSV" in Editor
2. File input dialog opens
3. User selects CSV file
4. FileReader reads file as text
5. parseCarouselCSV(csvContent) called
6. PapaParse parses CSV:
   - header: true (first row as keys)
   - skipEmptyLines: true
   - transformHeader: (h) => h.trim()
7. Rows grouped by carousel_id
8. Each group converted to CarouselData
9. Validation for each slide:
   - Valid layout_type
   - Valid hex colors
   - Positive slide_number
10. Errors collected and displayed in toast
11. Valid carousels added to project
12. First carousel selected
13. Auto-save triggered
```

### CSV Export Flow

```
1. User clicks "Export CSV" in Editor
2. All carousels flattened to slide array
3. PapaParse.unparse(slides) converts to CSV
4. Blob created with CSV content
5. Download link created
6. Filename: `{project_name}-export.csv`
7. Click link programmatically
8. Toast: "CSV exported"
```

### Validation Rules

**Layout Type**:
```typescript
const validLayouts = [
  'dictionary_entry', 'minimalist_focus', 'bold_callout',
  'header_body', 'quote_highlight', 'list_layout',
  'stat_showcase', 'split_content', 'image_overlay',
  'two_part_vertical', 'anti_marketing_hook',
  'anti_marketing_content', 'anti_marketing_cta'
];

// Also accept custom layouts: custom-{id}
const isValid = validLayouts.includes(layout_type) ||
                layout_type.startsWith('custom-');
```

**Colors**:
```typescript
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

if (!hexColorRegex.test(background_color)) {
  errors.push(`Invalid background_color: ${background_color}`);
}
```

**Slide Number**:
```typescript
if (isNaN(slide_number) || slide_number < 1) {
  errors.push(`Invalid slide_number: ${slide_number}`);
}
```

### Error Handling

**Error Display**:
```typescript
if (errors.length > 0) {
  toast.error(
    `CSV validation failed:\n${errors.join('\n')}`,
    { duration: 5000 }
  );
  return;
}
```

**Partial Import**:
- Valid carousels are imported
- Invalid carousels are skipped with error message
- User can fix CSV and re-import

---

## Development Guide

### Local Development

**Setup**:
```bash
# Clone repository
git clone <repo_url>
cd Social-Post-Helper

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add VITE_GOOGLE_FONTS_API_KEY=your_key_here

# Start dev server
pnpm dev

# Open browser to http://localhost:3000
```

**Build**:
```bash
# Production build
pnpm build

# Preview production build
pnpm preview

# Output: dist/public/
```

### Adding New Layout Types

**Step 1**: Add to TypeScript types
```typescript
// client/src/types/carousel.ts
export type LayoutType =
  | 'dictionary_entry'
  // ... existing types
  | 'your_new_layout';
```

**Step 2**: Add to layout constants
```typescript
// client/src/lib/constants.ts
export const BUILT_IN_LAYOUTS = [
  // ... existing layouts
  { id: 'your_new_layout', name: 'Your New Layout' }
];
```

**Step 3**: Implement rendering
```typescript
// client/src/components/LayoutRenderer.tsx
case 'your_new_layout':
  return (
    <div style={{
      background: slide.background_color,
      color: slide.font_color,
      fontFamily: fonts.heading
    }}>
      <h1>{slide.title}</h1>
      <p>{slide.body_text}</p>
    </div>
  );
```

**Step 4**: Update validation
```typescript
// client/src/lib/csvParser.ts
const validLayouts = [
  // ... existing layouts
  'your_new_layout'
];
```

**Step 5**: Document in LAYOUT_TYPES.md

### Adding New Export Presets

**Step 1**: Add to exportPresets.ts
```typescript
export const EXPORT_PRESETS: ExportPreset[] = [
  // ... existing presets
  {
    id: 'tiktok-video',
    name: 'TikTok',
    platform: 'TikTok',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Optimized for TikTok videos'
  }
];
```

**Step 2**: Test with various layouts

**Step 3**: Update documentation

### Adding New Templates

**Step 1**: Define template
```typescript
// client/src/lib/carouselTemplates.ts
export const CAROUSEL_TEMPLATES: CarouselTemplate[] = [
  // ... existing templates
  {
    id: 'fitness-challenge',
    name: '30-Day Fitness Challenge',
    description: 'Motivational fitness carousel',
    category: 'Health',
    slides: [
      {
        slide_number: 1,
        layout_type: 'bold_callout',
        background_color: '#ff6b6b',
        font_color: '#ffffff',
        accent_color: '#ffd93d',
        title: '30-Day Fitness Challenge',
        body_text: 'Transform your body in 30 days'
      },
      // ... more slides
    ]
  }
];
```

**Step 2**: Add template preview image (optional)

**Step 3**: Test template loading and editing

### Testing

**Unit Tests** (to be implemented):
```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom

# Run tests
pnpm test

# Coverage
pnpm test:coverage
```

**E2E Tests** (to be implemented):
```bash
# Install Playwright
pnpm add -D @playwright/test

# Run E2E tests
pnpm test:e2e
```

### Environment Variables

**Required**:
```env
VITE_GOOGLE_FONTS_API_KEY=your_google_fonts_api_key_here
```

**Optional**:
```env
VITE_APP_NAME=Social Post Helper
VITE_MAX_STORAGE_MB=5
VITE_ENABLE_ANALYTICS=false
```

### Browser Support

**Tested**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Required Features**:
- localStorage API
- FileReader API
- Canvas API
- ES2020+ JavaScript
- CSS Grid & Flexbox

### Deployment

**Vercel** (Recommended):
```bash
# Install Vercel CLI
pnpm add -G vercel

# Deploy
vercel

# Production
vercel --prod
```

**Configuration** (vercel.json):
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist/public",
  "framework": "vite",
  "env": {
    "VITE_GOOGLE_FONTS_API_KEY": "@google-fonts-api-key"
  }
}
```

**Netlify**:
```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Performance Monitoring

**Recommended Tools**:
- Lighthouse for performance audits
- React DevTools Profiler
- Chrome DevTools Performance tab
- localStorage usage monitoring

**Key Metrics**:
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- localStorage usage < 5MB
- Bundle size < 500KB (gzipped)

---

## Security Considerations

### XSS Vulnerabilities

**Issue**: Custom layouts use `dangerouslySetInnerHTML`

**Location**: `client/src/components/Settings.tsx:199`

**Risk**: Users can inject malicious JavaScript

**Mitigation**: Sanitize HTML with DOMPurify (Phase 1 task)

### Data Privacy

**Current State**:
- All data stored client-side in localStorage
- No server-side storage
- No analytics or tracking
- No user authentication

**Considerations**:
- Users should not store sensitive information
- localStorage is unencrypted
- Clearing browser data deletes all projects

### API Key Security

**Issue**: Google Fonts API key hardcoded in source

**Risk**: Key exposure in client-side code

**Mitigation**: Use environment variables (Phase 1 task)

### Content Security Policy

**Recommended CSP Headers**:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https:;
```

---

## Known Issues & Limitations

### Current Issues

1. **localStorage Quota**: No checking before save
2. **Google Fonts API Key**: Hardcoded in source
3. **XSS Risk**: Custom HTML not sanitized
4. **Export Performance**: html2canvas blocks UI
5. **No Mobile Support**: Desktop-only enforcement
6. **No Tests**: Zero test coverage
7. **No Virtualization**: Large slide lists render all items
8. **React 18 vs 19**: Documentation claimed React 19

### Limitations

1. **Storage**: 5-10MB localStorage limit
2. **Export**: Synchronous, blocks main thread
3. **Fonts**: Base64 encoding inefficient
4. **Images**: No image optimization or CDN
5. **Collaboration**: No multi-user support
6. **Versioning**: No undo/redo functionality
7. **Offline**: No service worker or PWA features

---

## Roadmap

### Phase 1: Critical Fixes ✅ (In Progress)
- Update documentation (this file)
- Add localStorage quota checking
- Move API keys to environment variables
- Add React.memo to LayoutRenderer
- Sanitize custom HTML with DOMPurify

### Phase 2: Performance ⏳
- Implement Web Workers for export
- Add virtualization for large lists
- Remove unused dependencies
- Optimize font loading

### Phase 3: Quality ⏳
- Add unit tests (80% coverage)
- Add E2E tests with Playwright
- Accessibility audit and ARIA labels
- Improve error boundaries

### Phase 4: Features 🔮
- Backend for larger datasets
- Real-time collaboration
- Version history with undo/redo
- Cloud sync
- Mobile app (React Native)
- Analytics dashboard

---

## Conclusion

The Social Post Helper has evolved into a sophisticated, feature-rich design platform that far exceeds its original scope as a simple carousel generator. The application demonstrates excellent TypeScript practices, clean component architecture, and thoughtful UX design.

**Key Strengths**:
- Comprehensive project management system
- Powerful custom layout builder
- Professional font management
- Multi-platform export capabilities
- localStorage persistence with auto-save

**Primary Areas for Improvement**:
- Performance optimizations (memoization, Web Workers)
- Security hardening (HTML sanitization, CSP)
- Storage quota management
- Test coverage
- Mobile responsiveness

The codebase is well-organized, maintainable, and ready for continued iteration and enhancement. With the critical fixes in Phase 1 and performance optimizations in Phase 2, the application will be production-ready and scalable for thousands of users.
