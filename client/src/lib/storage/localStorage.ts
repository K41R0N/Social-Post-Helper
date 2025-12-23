import type { Project, ProjectMetadata } from '../../types/project';
import type { CustomFont, FontSettings } from '../../types/font';
import type { DEFAULT_FONT_SETTINGS } from '../../types/font';
import type { CustomLayout } from '../../types/customLayout';
import type { SlideData } from '../../types/carousel';
import type {
  StorageProvider,
  ExportOptions,
  ExportResult,
  CarouselExport,
  FigmaImportResult,
} from './types';
import {
  safeSetItem,
  estimateDataSize,
  formatBytes,
  getStorageQuota,
  hasEnoughSpace,
} from '../storageUtils';

const STORAGE_KEYS = {
  PROJECTS: 'carousel_projects',
  CUSTOM_LAYOUTS: 'custom_layouts',
  CUSTOM_FONTS: 'custom_fonts',
  FONT_SETTINGS: 'font_settings',
};

const DEFAULT_FONT_SETTINGS_VALUE: FontSettings = {
  headingFont: 'AT-Kyrios Standard',
  bodyFont: 'AT-Kyrios Text',
  accentFont: 'Merriweather',
  googleFonts: [],
};

/**
 * localStorage-based storage provider for web version
 */
export class LocalStorageProvider implements StorageProvider {
  // ==================== PLATFORM ====================

  isDesktop(): boolean {
    return false;
  }

  async getPaths(): Promise<{
    projects: string;
    templates: string;
    fonts: string;
    documents: string;
  }> {
    // Web version doesn't have real paths
    return {
      projects: 'localStorage://projects',
      templates: 'localStorage://templates',
      fonts: 'localStorage://fonts',
      documents: 'localStorage://documents',
    };
  }

  // ==================== PROJECTS ====================

  async getAllProjects(): Promise<Project[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = await this.getAllProjects();
    return projects.find((p) => p.id === id) || null;
  }

  async saveProject(project: Project): Promise<void> {
    const projects = await this.getAllProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    project.modifiedAt = new Date().toISOString();

    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    // Check storage quota before saving
    const dataSize = estimateDataSize(projects);
    const quota = getStorageQuota();

    if (!hasEnoughSpace(dataSize)) {
      throw new Error(
        `Cannot save project: localStorage quota would be exceeded.\n\n` +
          `Project data size: ${formatBytes(dataSize)}\n` +
          `Storage used: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}\n` +
          `Available: ${formatBytes(quota.available)}\n\n` +
          `Try removing some old projects or custom fonts to free up space.`
      );
    }

    try {
      safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving project:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to save project');
    }
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await this.getAllProjects();
    const filtered = projects.filter((p) => p.id !== id);

    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }

  async duplicateProject(id: string): Promise<Project> {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error('Project not found');
    }

    const newProject: Project = {
      ...project,
      id: `${project.id}-copy-${Date.now()}`,
      name: `${project.name} (Copy)`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    await this.saveProject(newProject);
    return newProject;
  }

  async getProjectMetadata(): Promise<ProjectMetadata[]> {
    const projects = await this.getAllProjects();
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      slideCount: p.carousels.reduce((sum, c) => sum + c.slides.length, 0),
      carouselCount: p.carousels.length,
      createdAt: p.createdAt,
      modifiedAt: p.modifiedAt,
      description: p.description,
    }));
  }

  async createNewProject(name: string): Promise<Project> {
    const project: Project = {
      id: `project-${Date.now()}`,
      name,
      carousels: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    await this.saveProject(project);
    return project;
  }

  async renameProject(id: string, newName: string): Promise<void> {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error('Project not found');
    }

    project.name = newName;
    await this.saveProject(project);
  }

  // ==================== CUSTOM LAYOUTS ====================

  async getAllCustomLayouts(): Promise<CustomLayout[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_LAYOUTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom layouts:', error);
      return [];
    }
  }

  async getCustomLayout(id: string): Promise<CustomLayout | null> {
    const layouts = await this.getAllCustomLayouts();
    return layouts.find((l) => l.id === id) || null;
  }

  async saveCustomLayout(layout: CustomLayout): Promise<void> {
    const layouts = await this.getAllCustomLayouts();
    const index = layouts.findIndex((l) => l.id === layout.id);

    if (index >= 0) {
      layouts[index] = layout;
    } else {
      layouts.push(layout);
    }

    try {
      safeSetItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(layouts));
    } catch (error) {
      console.error('Error saving custom layout:', error);
      throw new Error('Failed to save custom layout');
    }
  }

  async deleteCustomLayout(id: string): Promise<void> {
    const layouts = await this.getAllCustomLayouts();
    const filtered = layouts.filter((l) => l.id !== id);

    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting custom layout:', error);
      throw new Error('Failed to delete custom layout');
    }
  }

  // ==================== FONTS ====================

  async getAllCustomFonts(): Promise<CustomFont[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_FONTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom fonts:', error);
      return [];
    }
  }

  async saveCustomFont(font: CustomFont): Promise<void> {
    const fonts = await this.getAllCustomFonts();
    const existing = fonts.findIndex((f) => f.id === font.id);

    if (existing >= 0) {
      fonts[existing] = font;
    } else {
      fonts.push(font);
    }

    // Check storage quota before saving
    const dataSize = estimateDataSize(fonts);
    const quota = getStorageQuota();

    if (!hasEnoughSpace(dataSize)) {
      throw new Error(
        `Cannot save font: localStorage quota would be exceeded.\n\n` +
          `Font size: ${formatBytes(dataSize)}\n` +
          `Storage used: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}\n` +
          `Available: ${formatBytes(quota.available)}\n\n` +
          `Try removing some custom fonts or projects to free up space.`
      );
    }

    try {
      safeSetItem(STORAGE_KEYS.CUSTOM_FONTS, JSON.stringify(fonts));
    } catch (error) {
      console.error('Error saving custom font:', error);
      throw new Error('Failed to save font. File may be too large.');
    }
  }

  async deleteCustomFont(id: string): Promise<void> {
    const fonts = await this.getAllCustomFonts();
    const filtered = fonts.filter((f) => f.id !== id);

    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FONTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting custom font:', error);
      throw new Error('Failed to delete font');
    }
  }

  async uploadFont(file: File): Promise<CustomFont> {
    // Warn if file is very large (>1MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 1) {
      const quota = getStorageQuota();
      console.warn(
        `Large font file detected: ${fileSizeMB.toFixed(2)}MB. ` +
          `Current storage: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}`
      );
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          const extension = file.name.split('.').pop()?.toLowerCase();

          if (!extension || !['ttf', 'otf', 'woff', 'woff2'].includes(extension)) {
            reject(new Error('Unsupported font format. Please use TTF, OTF, WOFF, or WOFF2.'));
            return;
          }

          const fontName = file.name.replace(/\.[^/.]+$/, '');
          const fontFamily = fontName.replace(/[-_]/g, ' ');

          const font: CustomFont = {
            id: `font-${Date.now()}`,
            name: fontName,
            family: fontFamily,
            format: extension as 'ttf' | 'otf' | 'woff' | 'woff2',
            base64Data,
            uploadedAt: new Date().toISOString(),
          };

          await this.saveCustomFont(font);
          resolve(font);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read font file'));
      reader.readAsDataURL(file);
    });
  }

  async getFontSettings(): Promise<FontSettings> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FONT_SETTINGS);
      return stored ? JSON.parse(stored) : DEFAULT_FONT_SETTINGS_VALUE;
    } catch (error) {
      console.error('Error loading font settings:', error);
      return DEFAULT_FONT_SETTINGS_VALUE;
    }
  }

  async saveFontSettings(settings: FontSettings): Promise<void> {
    try {
      safeSetItem(STORAGE_KEYS.FONT_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving font settings:', error);
      throw new Error('Failed to save font settings');
    }
  }

  async addGoogleFont(family: string): Promise<void> {
    const settings = await this.getFontSettings();
    if (!settings.googleFonts.includes(family)) {
      settings.googleFonts.push(family);
      await this.saveFontSettings(settings);
    }
  }

  async removeGoogleFont(family: string): Promise<void> {
    const settings = await this.getFontSettings();
    settings.googleFonts = settings.googleFonts.filter((f) => f !== family);
    await this.saveFontSettings(settings);
  }

  // ==================== EXPORT ====================

  async exportSlide(
    slide: SlideData,
    svgContent: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // Web version: trigger download
    try {
      const filename = `slide-${slide.slide_number}-${options.preset.id}.${options.format}`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filePath: filename };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async exportProjectFolder(
    project: Project,
    carousels: CarouselExport[]
  ): Promise<ExportResult> {
    // Web version: create ZIP and download
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Create folder structure in ZIP
      const projectFolder = zip.folder(project.name);
      if (!projectFolder) {
        throw new Error('Failed to create project folder');
      }

      for (const carousel of carousels) {
        const carouselFolder = projectFolder.folder(carousel.name);
        if (!carouselFolder) continue;

        for (const slide of carousel.slides) {
          carouselFolder.file(slide.name, slide.content);
        }
      }

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
