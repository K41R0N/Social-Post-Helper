# Go-Round Desktop App - Implementation Plan

## Vision

Transform Go-Round into a desktop application that integrates seamlessly with Figma:
- **Export**: Generate SVG files organized in folders that Figma can edit
- **Import**: Parse Figma-exported SVGs as reusable Go-Round templates
- **Bulk Generation**: Use templates to create 100s of assets with variable data

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron Main Process                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ File System │  │   IPC       │  │  Native Dialogs         │  │
│  │ Operations  │  │   Bridge    │  │  (Save/Open/Folder)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ IPC
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Electron Renderer Process                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    React Application                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ Storage      │  │ SVG Export   │  │ Figma Import     │  │ │
│  │  │ Abstraction  │  │ Engine       │  │ Parser           │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Desktop Framework | Electron 33+ | Cross-platform (Windows, Linux, macOS) |
| Build Tool | electron-vite | Seamless Vite integration |
| SVG Generation | Custom React-to-SVG | Full control over output |
| SVG Parsing | svg-parser + custom | Extract template variables |
| File Storage | JSON files | Human-readable, git-friendly |
| Auto-save | Debounced writes | UX best practice |

---

## Feature Specifications

### 1. SVG Export System

**Goal**: Export slides as editable SVG files that Figma can fully edit

**Output Structure**:
```
~/Documents/GoRound/
├── projects/
│   └── my-campaign/
│       ├── project.json              # Project metadata
│       ├── assets/                   # Imported images
│       │   └── logo.png
│       ├── Product Launch/           # Carousel folder
│       │   ├── carousel.json         # Carousel metadata
│       │   ├── slide-001.svg
│       │   ├── slide-002.svg
│       │   └── slide-003.svg
│       └── Social Posts/
│           ├── carousel.json
│           └── slide-001.svg
└── templates/                        # Imported Figma templates
    ├── figma-header.svg
    └── figma-card.svg
```

**SVG Structure** (Figma-optimized):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="1080" height="1080"
     viewBox="0 0 1080 1080">

  <!-- Embedded fonts for portability -->
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'Poppins';
        src: url('data:font/woff2;base64,...');
      }
    </style>
  </defs>

  <!-- Background -->
  <rect id="background" width="1080" height="1080" fill="#1a1a1a"/>

  <!-- Content layers with semantic IDs -->
  <g id="content">
    <text id="title" x="540" y="400"
          font-family="Poppins" font-size="72" fill="#ffffff"
          text-anchor="middle">
      Your Title Here
    </text>

    <text id="body" x="540" y="520"
          font-family="Inter" font-size="32" fill="#cccccc"
          text-anchor="middle">
      Body text content
    </text>

    <rect id="accent-bar" x="440" y="600"
          width="200" height="4" fill="#3b82f6"/>
  </g>

  <!-- Go-Round metadata (hidden, for re-import) -->
  <metadata>
    <goround:slide xmlns:goround="https://goround.dev/schema">
      <goround:layout>header_body</goround:layout>
      <goround:variables>
        <goround:var name="title" element="title"/>
        <goround:var name="body_text" element="body"/>
        <goround:var name="accent_color" element="accent-bar" attr="fill"/>
      </goround:variables>
    </goround:slide>
  </metadata>
</svg>
```

### 2. Figma Import System

**Goal**: Import Figma SVG exports and convert them to Go-Round templates

**Workflow**:
```
1. User designs layout in Figma
2. User adds special naming convention:
   - Text layers: "{{title}}", "{{body_text}}", etc.
   - Color fills: Named "accent", "background", etc.
3. User exports as SVG from Figma
4. Go-Round parses SVG and extracts:
   - Structure (groups, layers)
   - Variable placeholders ({{...}} text)
   - Color references
5. Template saved with variable mappings
6. User can now bulk-generate with CSV data
```

**Figma Naming Convention** (for import):
```
Layer names in Figma → Go-Round variables:
- "{{title}}"          → title field
- "{{body_text}}"      → body_text field
- "{{subtitle}}"       → subtitle field
- "{{quote}}"          → quote field
- "#background"        → background_color
- "#accent"            → accent_color
- "#text"              → font_color
```

**Import Parser Features**:
- Detect `{{variable}}` patterns in text elements
- Map layer names to template variables
- Preserve font stacks and fallbacks
- Extract color palette
- Maintain layer hierarchy
- Generate CSS from SVG styles

### 3. Storage Abstraction Layer

**Goal**: Unified API that works with localStorage (web) or filesystem (desktop)

```typescript
// client/src/lib/storage/index.ts
interface StorageProvider {
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;

  // Templates
  getTemplates(): Promise<CustomLayout[]>;
  saveTemplate(template: CustomLayout): Promise<void>;
  deleteTemplate(id: string): Promise<void>;

  // Fonts
  getFonts(): Promise<CustomFont[]>;
  saveFont(font: CustomFont): Promise<void>;
  deleteFont(id: string): Promise<void>;

  // Settings
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;

  // Export
  exportProject(projectId: string, options: ExportOptions): Promise<string>;
  exportSlide(slide: SlideData, options: ExportOptions): Promise<string>;

  // Import
  importTemplate(svgPath: string): Promise<CustomLayout>;
  importProject(path: string): Promise<Project>;
}

// Implementations
class LocalStorageProvider implements StorageProvider { ... }
class FileSystemProvider implements StorageProvider { ... }

// Factory
export function getStorageProvider(): StorageProvider {
  if (window.electronAPI) {
    return new FileSystemProvider();
  }
  return new LocalStorageProvider();
}
```

### 4. Auto-Save + Manual Save UX

**Best Practices Research**:

| App | Auto-Save Behavior | Manual Save |
|-----|-------------------|-------------|
| Figma | Continuous auto-save | No manual save needed |
| VS Code | Auto-save toggle (off by default) | Cmd+S explicit save |
| Notion | Auto-save with sync indicator | No manual save |
| Google Docs | Real-time auto-save | Version history |

**Go-Round Approach** (Hybrid):
```
┌─────────────────────────────────────────────────────────────────┐
│  Project: Summer Campaign                    ● Saved            │
│                                              ○ Saving...        │
│                                              ○ Unsaved changes  │
└─────────────────────────────────────────────────────────────────┘

Features:
1. Auto-save: Debounced (2s delay after last change)
2. Save indicator: Visual status in header
3. Manual save: Cmd/Ctrl+S for immediate save
4. Version snapshots: Daily auto-backups
5. Export: Separate action (not auto)
```

**Implementation**:
```typescript
// Auto-save hook
function useAutoSave(project: Project, delay = 2000) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  useEffect(() => {
    setSaveStatus('unsaved');

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      await storage.saveProject(project);
      setSaveStatus('saved');
    }, delay);

    return () => clearTimeout(timer);
  }, [project]);

  // Manual save
  const saveNow = useCallback(async () => {
    setSaveStatus('saving');
    await storage.saveProject(project);
    setSaveStatus('saved');
  }, [project]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveNow();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveNow]);

  return { saveStatus, saveNow };
}
```

---

## Web/Desktop Feature Parity Tracker

### Core Features

| Feature | Web | Desktop | Notes |
|---------|-----|---------|-------|
| Project Management | ✅ | ✅ | Same UI |
| Slide Editor | ✅ | ✅ | Same UI |
| Layout Renderer | ✅ | ✅ | Same component |
| Drag & Drop Reorder | ✅ | ✅ | Same library |
| CSV Import/Export | ✅ | ✅ | Same parser |
| Template Library | ✅ | ✅ | Same templates |
| Custom Layouts | ✅ | ✅ | Same editor |
| Font Management | ✅ | ✅ | Same UI |
| Theme (Dark/Light) | ✅ | ✅ | Same context |

### Export Features

| Feature | Web | Desktop | Notes |
|---------|-----|---------|-------|
| PNG Export | ✅ | ✅ | html2canvas |
| SVG Export | ⏳ | ✅ | Desktop priority |
| Bulk ZIP Download | ✅ | ⏳ | Folder export preferred |
| Folder Export | ❌ | ✅ | Desktop only (filesystem) |
| Export Presets | ✅ | ✅ | Same presets |

### Import Features

| Feature | Web | Desktop | Notes |
|---------|-----|---------|-------|
| CSV Import | ✅ | ✅ | Same parser |
| Figma SVG Import | ⏳ | ✅ | Desktop priority |
| Template Import | ⏳ | ✅ | JSON files |

### Storage Features

| Feature | Web | Desktop | Notes |
|---------|-----|---------|-------|
| localStorage | ✅ | ❌ | Web only |
| File System | ❌ | ✅ | Desktop only |
| Auto-save | ⏳ | ✅ | Add to web |
| Manual Save (Cmd+S) | ⏳ | ✅ | Add to web |
| Save Indicator | ⏳ | ✅ | Add to web |
| Version History | ❌ | ✅ | Desktop only (files) |

### Desktop-Only Features

| Feature | Status | Notes |
|---------|--------|-------|
| Native File Dialogs | ✅ | Open/Save/Folder |
| Menu Bar | ✅ | File, Edit, View, Help |
| Keyboard Shortcuts | ✅ | Native feel |
| System Tray | ⏳ | Optional |
| Recent Projects | ✅ | OS integration |
| Drag Files to App | ✅ | Native DnD |

### Legend
- ✅ Implemented
- ⏳ Planned (port to other platform)
- ❌ Not applicable

---

## Implementation Phases

### Phase 1: Electron Foundation (Current)
- [ ] Set up electron-vite project structure
- [ ] Configure build for Windows + Linux
- [ ] Create main process with IPC handlers
- [ ] Implement basic file dialogs
- [ ] Add menu bar

### Phase 2: Storage Migration
- [ ] Create storage abstraction interface
- [ ] Implement FileSystemProvider
- [ ] Migrate localStorage calls to abstraction
- [ ] Add auto-save with status indicator
- [ ] Implement Cmd+S manual save

### Phase 3: SVG Export Engine
- [ ] Create React-to-SVG renderer
- [ ] Embed fonts in SVG
- [ ] Add Go-Round metadata to SVG
- [ ] Implement folder export structure
- [ ] Add export progress UI

### Phase 4: Figma Import Parser
- [ ] Parse SVG structure
- [ ] Extract {{variable}} placeholders
- [ ] Map colors to template fields
- [ ] Generate CustomLayout from SVG
- [ ] Add import UI

### Phase 5: Polish & Sync
- [ ] Port auto-save to web version
- [ ] Port save indicator to web version
- [ ] Add SVG export to web (download)
- [ ] Documentation
- [ ] Testing on Fedora + Windows

---

## File Structure (Desktop)

```
goround.dev/
├── client/                          # React app (shared)
│   └── src/
│       ├── lib/
│       │   └── storage/
│       │       ├── index.ts         # Storage abstraction
│       │       ├── localStorage.ts  # Web implementation
│       │       └── fileSystem.ts    # Desktop implementation
│       └── ...
├── electron/                        # Electron-specific
│   ├── main/
│   │   ├── index.ts                 # Main process entry
│   │   ├── ipc.ts                   # IPC handlers
│   │   ├── fileSystem.ts            # FS operations
│   │   ├── dialogs.ts               # Native dialogs
│   │   └── menu.ts                  # Menu bar
│   ├── preload/
│   │   └── index.ts                 # Preload script (bridge)
│   └── resources/                   # App icons, etc.
├── electron.vite.config.ts          # electron-vite config
├── electron-builder.yml             # Build/package config
└── package.json                     # Updated scripts
```

---

## Commands

```bash
# Development
pnpm dev              # Web development
pnpm dev:electron     # Desktop development

# Build
pnpm build            # Web production build
pnpm build:electron   # Desktop production build

# Package
pnpm package:linux    # Create .deb, .rpm, .AppImage
pnpm package:windows  # Create .exe installer
pnpm package:all      # All platforms
```

---

## Next Steps

1. **Now**: Set up Electron with electron-vite
2. **Then**: Create storage abstraction layer
3. **Then**: Implement SVG export
4. **Then**: Build Figma import parser
5. **Finally**: Polish and sync features

Ready to begin implementation!
