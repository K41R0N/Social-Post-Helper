import type { Project, ProjectMetadata } from '../../types/project';
import type { CustomFont, FontSettings } from '../../types/font';
import type { CustomLayout } from '../../types/customLayout';
import type { SlideData } from '../../types/carousel';

/**
 * Export options for generating output files
 */
export interface ExportOptions {
  format: 'svg' | 'png';
  preset: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  includeMetadata?: boolean;
}

/**
 * Export result from saving a file
 */
export interface ExportResult {
  success: boolean;
  filePath?: string;
  canceled?: boolean;
  error?: string;
}

/**
 * Carousel export structure for folder exports
 */
export interface CarouselExport {
  name: string;
  slides: {
    name: string;
    content: string;
  }[];
}

/**
 * Figma import result
 */
export interface FigmaImportResult {
  success: boolean;
  template?: CustomLayout;
  error?: string;
}

/**
 * Storage provider interface
 * Abstracts localStorage (web) and filesystem (desktop) storage
 */
export interface StorageProvider {
  // ==================== PLATFORM ====================

  /** Check if running in desktop (Electron) mode */
  isDesktop(): boolean;

  /** Get platform-specific paths */
  getPaths(): Promise<{
    projects: string;
    templates: string;
    fonts: string;
    documents: string;
  }>;

  // ==================== PROJECTS ====================

  /** Get all projects */
  getAllProjects(): Promise<Project[]>;

  /** Get a single project by ID */
  getProject(id: string): Promise<Project | null>;

  /** Save a project (create or update) */
  saveProject(project: Project): Promise<void>;

  /** Delete a project by ID */
  deleteProject(id: string): Promise<void>;

  /** Duplicate a project */
  duplicateProject(id: string): Promise<Project>;

  /** Get lightweight project metadata for listing */
  getProjectMetadata(): Promise<ProjectMetadata[]>;

  /** Create a new empty project */
  createNewProject(name: string): Promise<Project>;

  /** Rename a project */
  renameProject(id: string, newName: string): Promise<void>;

  // ==================== CUSTOM LAYOUTS ====================

  /** Get all custom layouts */
  getAllCustomLayouts(): Promise<CustomLayout[]>;

  /** Get a single custom layout by ID */
  getCustomLayout(id: string): Promise<CustomLayout | null>;

  /** Save a custom layout (create or update) */
  saveCustomLayout(layout: CustomLayout): Promise<void>;

  /** Delete a custom layout by ID */
  deleteCustomLayout(id: string): Promise<void>;

  // ==================== FONTS ====================

  /** Get all custom fonts */
  getAllCustomFonts(): Promise<CustomFont[]>;

  /** Save a custom font */
  saveCustomFont(font: CustomFont): Promise<void>;

  /** Delete a custom font by ID */
  deleteCustomFont(id: string): Promise<void>;

  /** Upload a font file */
  uploadFont(file: File): Promise<CustomFont>;

  /** Get font settings */
  getFontSettings(): Promise<FontSettings>;

  /** Save font settings */
  saveFontSettings(settings: FontSettings): Promise<void>;

  /** Add a Google Font to saved list */
  addGoogleFont(family: string): Promise<void>;

  /** Remove a Google Font from saved list */
  removeGoogleFont(family: string): Promise<void>;

  // ==================== EXPORT ====================

  /** Export a single slide */
  exportSlide(
    slide: SlideData,
    svgContent: string,
    options: ExportOptions
  ): Promise<ExportResult>;

  /** Export entire project to folder structure */
  exportProjectFolder(
    project: Project,
    carousels: CarouselExport[],
    options?: { openAfterExport?: boolean }
  ): Promise<ExportResult>;

  // ==================== IMPORT ====================

  /** Import Figma SVG as template (desktop only) */
  importFigmaSvg?(): Promise<FigmaImportResult>;

  // ==================== RECENT FILES (Desktop) ====================

  /** Get recent projects */
  getRecentProjects?(): Promise<{ path: string; name: string; timestamp: number }[]>;

  /** Add to recent projects */
  addRecentProject?(projectPath: string, projectName: string): Promise<void>;

  /** Clear recent projects */
  clearRecentProjects?(): Promise<void>;
}

/**
 * Save status for auto-save indicator
 */
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
  enabled: boolean;
  delayMs: number;
}
