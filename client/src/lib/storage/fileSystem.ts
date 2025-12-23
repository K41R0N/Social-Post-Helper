import type { Project, ProjectMetadata } from '../../types/project';
import type { CustomFont, FontSettings } from '../../types/font';
import type { CustomLayout } from '../../types/customLayout';
import type { SlideData } from '../../types/carousel';
import type {
  StorageProvider,
  ExportOptions,
  ExportResult,
  CarouselExport,
  FigmaImportResult,
} from './types';
import { parseFigmaSvg } from '../figmaParser';

const DEFAULT_FONT_SETTINGS: FontSettings = {
  headingFont: 'AT-Kyrios Standard',
  bodyFont: 'AT-Kyrios Text',
  accentFont: 'Merriweather',
  googleFonts: [],
};

/**
 * Get the Electron API from the window object
 */
function getElectronAPI() {
  if (!window.electronAPI) {
    throw new Error('Electron API not available. Are you running in desktop mode?');
  }
  return window.electronAPI;
}

/**
 * FileSystem-based storage provider for desktop (Electron) version
 */
export class FileSystemProvider implements StorageProvider {
  private projectsPath: string | null = null;
  private templatesPath: string | null = null;
  private fontsPath: string | null = null;

  // ==================== PLATFORM ====================

  isDesktop(): boolean {
    return true;
  }

  async getPaths(): Promise<{
    projects: string;
    templates: string;
    fonts: string;
    documents: string;
  }> {
    const api = getElectronAPI();

    if (!this.projectsPath) {
      this.projectsPath = await api.app.getProjectsPath();
    }
    if (!this.templatesPath) {
      this.templatesPath = await api.app.getTemplatesPath();
    }
    if (!this.fontsPath) {
      this.fontsPath = await api.app.getFontsPath();
    }

    const documents = await api.app.getPath('documents');

    return {
      projects: this.projectsPath,
      templates: this.templatesPath,
      fonts: this.fontsPath,
      documents,
    };
  }

  private async getProjectsFilePath(): Promise<string> {
    const paths = await this.getPaths();
    return `${paths.projects}/projects.json`;
  }

  private async getLayoutsFilePath(): Promise<string> {
    const paths = await this.getPaths();
    return `${paths.templates}/layouts.json`;
  }

  private async getFontsFilePath(): Promise<string> {
    const paths = await this.getPaths();
    return `${paths.fonts}/fonts.json`;
  }

  private async getSettingsFilePath(): Promise<string> {
    const paths = await this.getPaths();
    return `${paths.fonts}/settings.json`;
  }

  // ==================== PROJECTS ====================

  async getAllProjects(): Promise<Project[]> {
    try {
      const api = getElectronAPI();
      const filePath = await this.getProjectsFilePath();
      const exists = await api.fs.exists(filePath);

      if (!exists) {
        return [];
      }

      const result = await api.fs.readFile(filePath);
      if (!result.success || !result.data) {
        return [];
      }

      return JSON.parse(result.data);
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
    const api = getElectronAPI();
    const projects = await this.getAllProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    project.modifiedAt = new Date().toISOString();

    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    const filePath = await this.getProjectsFilePath();
    const result = await api.fs.writeFile(filePath, JSON.stringify(projects, null, 2));

    if (!result.success) {
      throw new Error(result.error || 'Failed to save project');
    }

    // Add to recent projects
    await this.addRecentProject(filePath, project.name);
  }

  async deleteProject(id: string): Promise<void> {
    const api = getElectronAPI();
    const projects = await this.getAllProjects();
    const filtered = projects.filter((p) => p.id !== id);

    const filePath = await this.getProjectsFilePath();
    const result = await api.fs.writeFile(filePath, JSON.stringify(filtered, null, 2));

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete project');
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
      const api = getElectronAPI();
      const filePath = await this.getLayoutsFilePath();
      const exists = await api.fs.exists(filePath);

      if (!exists) {
        return [];
      }

      const result = await api.fs.readFile(filePath);
      if (!result.success || !result.data) {
        return [];
      }

      return JSON.parse(result.data);
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
    const api = getElectronAPI();
    const layouts = await this.getAllCustomLayouts();
    const index = layouts.findIndex((l) => l.id === layout.id);

    if (index >= 0) {
      layouts[index] = layout;
    } else {
      layouts.push(layout);
    }

    const filePath = await this.getLayoutsFilePath();
    const result = await api.fs.writeFile(filePath, JSON.stringify(layouts, null, 2));

    if (!result.success) {
      throw new Error(result.error || 'Failed to save custom layout');
    }
  }

  async deleteCustomLayout(id: string): Promise<void> {
    const api = getElectronAPI();
    const layouts = await this.getAllCustomLayouts();
    const filtered = layouts.filter((l) => l.id !== id);

    const filePath = await this.getLayoutsFilePath();
    const result = await api.fs.writeFile(filePath, JSON.stringify(filtered, null, 2));

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete custom layout');
    }
  }

  // ==================== FONTS ====================

  async getAllCustomFonts(): Promise<CustomFont[]> {
    try {
      const api = getElectronAPI();
      const filePath = await this.getFontsFilePath();
      const exists = await api.fs.exists(filePath);

      if (!exists) {
        return [];
      }

      const result = await api.fs.readFile(filePath);
      if (!result.success || !result.data) {
        return [];
      }

      return JSON.parse(result.data);
    } catch (error) {
      console.error('Error loading custom fonts:', error);
      return [];
    }
  }

  async saveCustomFont(font: CustomFont): Promise<void> {
    const api = getElectronAPI();
    const fonts = await this.getAllCustomFonts();
    const existing = fonts.findIndex((f) => f.id === font.id);

    if (existing >= 0) {
      fonts[existing] = font;
    } else {
      fonts.push(font);
    }

    const filePath = await this.getFontsFilePath();
    const result = await api.fs.writeFile(filePath, JSON.stringify(fonts, null, 2));

    if (!result.success) {
      throw new Error(result.error || 'Failed to save custom font');
    }
  }

  async deleteCustomFont(id: string): Promise<void> {
    const api = getElectronAPI();
    const fonts = await this.getAllCustomFonts();
    const filtered = fonts.filter((f) => f.id !== id);

    const filePath = await this.getFontsFilePath();
    const result = await api.fs.writeFile(filePath, JSON.stringify(filtered, null, 2));

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete custom font');
    }
  }

  async uploadFont(file: File): Promise<CustomFont> {
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
      const api = getElectronAPI();
      const filePath = await this.getSettingsFilePath();
      const exists = await api.fs.exists(filePath);

      if (!exists) {
        return DEFAULT_FONT_SETTINGS;
      }

      const result = await api.fs.readFile(filePath);
      if (!result.success || !result.data) {
        return DEFAULT_FONT_SETTINGS;
      }

      return JSON.parse(result.data);
    } catch (error) {
      console.error('Error loading font settings:', error);
      return DEFAULT_FONT_SETTINGS;
    }
  }

  async saveFontSettings(settings: FontSettings): Promise<void> {
    const api = getElectronAPI();
    const filePath = await this.getSettingsFilePath();
    const result = await api.fs.writeFile(filePath, JSON.stringify(settings, null, 2));

    if (!result.success) {
      throw new Error(result.error || 'Failed to save font settings');
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
    const api = getElectronAPI();
    const filename = `slide-${String(slide.slide_number).padStart(3, '0')}.${options.format}`;

    return api.export.saveSvg({
      svgContent,
      defaultName: filename,
    });
  }

  async exportProjectFolder(
    project: Project,
    carousels: CarouselExport[],
    options?: { openAfterExport?: boolean }
  ): Promise<ExportResult> {
    const api = getElectronAPI();

    const result = await api.export.saveProjectFolder({
      projectName: project.name,
      carousels: carousels.map((c) => ({
        name: c.name,
        slides: c.slides.map((s) => ({
          name: s.name,
          svgContent: s.content,
        })),
      })),
    });

    if (result.success && result.exportPath && options?.openAfterExport) {
      await api.shell.openPath(result.exportPath);
    }

    return result;
  }

  // ==================== IMPORT ====================

  async importFigmaSvg(): Promise<FigmaImportResult> {
    try {
      const api = getElectronAPI();
      const result = await api.import.figmaSvg();

      if (!result.success || result.canceled || !result.files?.length) {
        return { success: false };
      }

      // Parse the first SVG file
      const file = result.files[0];
      const template = await parseFigmaSvg(file.content, file.name);

      if (template) {
        // Save the imported template
        await this.saveCustomLayout(template);
        return { success: true, template };
      }

      return { success: false, error: 'Failed to parse Figma SVG' };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // ==================== RECENT FILES ====================

  async getRecentProjects(): Promise<{ path: string; name: string; timestamp: number }[]> {
    try {
      const api = getElectronAPI();
      return api.recent.get();
    } catch {
      return [];
    }
  }

  async addRecentProject(projectPath: string, projectName: string): Promise<void> {
    try {
      const api = getElectronAPI();
      await api.recent.add(projectPath, projectName);
    } catch (error) {
      console.error('Failed to add recent project:', error);
    }
  }

  async clearRecentProjects(): Promise<void> {
    try {
      const api = getElectronAPI();
      await api.recent.clear();
    } catch (error) {
      console.error('Failed to clear recent projects:', error);
    }
  }
}
