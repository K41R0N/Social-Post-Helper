import { ipcMain, dialog, app, shell } from 'electron';
import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// User data paths
const userDataPath = app.getPath('userData');
const projectsPath = join(userDataPath, 'projects');
const templatesPath = join(userDataPath, 'templates');
const fontsPath = join(userDataPath, 'fonts');

// Ensure directories exist
[projectsPath, templatesPath, fontsPath].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

export function setupIpcHandlers(): void {
  // ==================== FILE DIALOGS ====================

  ipcMain.handle('dialog:openFile', async (_, options: {
    title?: string;
    filters?: { name: string; extensions: string[] }[];
    multiple?: boolean;
  }) => {
    const result = await dialog.showOpenDialog({
      title: options.title || 'Open File',
      filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
      properties: options.multiple ? ['openFile', 'multiSelections'] : ['openFile'],
    });
    return result.canceled ? null : result.filePaths;
  });

  ipcMain.handle('dialog:saveFile', async (_, options: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => {
    const result = await dialog.showSaveDialog({
      title: options.title || 'Save File',
      defaultPath: options.defaultPath,
      filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
    });
    return result.canceled ? null : result.filePath;
  });

  ipcMain.handle('dialog:openFolder', async (_, options: {
    title?: string;
    defaultPath?: string;
  }) => {
    const result = await dialog.showOpenDialog({
      title: options.title || 'Select Folder',
      defaultPath: options.defaultPath,
      properties: ['openDirectory', 'createDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // ==================== FILE SYSTEM OPERATIONS ====================

  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('fs:readBinaryFile', async (_, filePath: string) => {
    try {
      const buffer = await fs.readFile(filePath);
      return { success: true, data: buffer.toString('base64') };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('fs:writeBinaryFile', async (_, filePath: string, base64Data: string) => {
    try {
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.writeFile(filePath, buffer);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('fs:deleteFile', async (_, filePath: string) => {
    try {
      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('fs:exists', async (_, filePath: string) => {
    return existsSync(filePath);
  });

  ipcMain.handle('fs:readDir', async (_, dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return {
        success: true,
        data: entries.map(entry => ({
          name: entry.name,
          isDirectory: entry.isDirectory(),
          isFile: entry.isFile(),
        })),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('fs:mkdir', async (_, dirPath: string) => {
    try {
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('fs:rmdir', async (_, dirPath: string) => {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // ==================== APP PATHS ====================

  ipcMain.handle('app:getPath', (_, name: 'userData' | 'documents' | 'downloads' | 'home') => {
    return app.getPath(name);
  });

  ipcMain.handle('app:getProjectsPath', () => projectsPath);
  ipcMain.handle('app:getTemplatesPath', () => templatesPath);
  ipcMain.handle('app:getFontsPath', () => fontsPath);

  // ==================== SHELL OPERATIONS ====================

  ipcMain.handle('shell:openPath', async (_, filePath: string) => {
    return shell.openPath(filePath);
  });

  ipcMain.handle('shell:showItemInFolder', (_, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle('shell:openExternal', async (_, url: string) => {
    await shell.openExternal(url);
  });

  // ==================== EXPORT OPERATIONS ====================

  ipcMain.handle('export:saveSvg', async (_, options: {
    svgContent: string;
    defaultName: string;
    projectPath?: string;
  }) => {
    try {
      let filePath: string;

      if (options.projectPath) {
        // Save directly to project folder
        filePath = join(options.projectPath, options.defaultName);
      } else {
        // Show save dialog
        const result = await dialog.showSaveDialog({
          title: 'Save SVG',
          defaultPath: options.defaultName,
          filters: [{ name: 'SVG Files', extensions: ['svg'] }],
        });
        if (result.canceled || !result.filePath) {
          return { success: false, canceled: true };
        }
        filePath = result.filePath;
      }

      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      await fs.writeFile(filePath, options.svgContent, 'utf-8');
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('export:saveProjectFolder', async (_, options: {
    projectName: string;
    carousels: {
      name: string;
      slides: { name: string; svgContent: string }[];
    }[];
  }) => {
    try {
      // Let user pick export location
      const result = await dialog.showOpenDialog({
        title: 'Select Export Location',
        properties: ['openDirectory', 'createDirectory'],
      });

      if (result.canceled || !result.filePaths[0]) {
        return { success: false, canceled: true };
      }

      const exportPath = join(result.filePaths[0], options.projectName);

      // Create project folder
      if (!existsSync(exportPath)) {
        mkdirSync(exportPath, { recursive: true });
      }

      // Create carousel folders and save slides
      for (const carousel of options.carousels) {
        const carouselPath = join(exportPath, carousel.name);
        if (!existsSync(carouselPath)) {
          mkdirSync(carouselPath, { recursive: true });
        }

        for (const slide of carousel.slides) {
          const slidePath = join(carouselPath, slide.name);
          await fs.writeFile(slidePath, slide.svgContent, 'utf-8');
        }
      }

      return { success: true, exportPath };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // ==================== IMPORT OPERATIONS ====================

  ipcMain.handle('import:figmaSvg', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Import Figma SVG',
        filters: [{ name: 'SVG Files', extensions: ['svg'] }],
        properties: ['openFile', 'multiSelections'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      const files = await Promise.all(
        result.filePaths.map(async (filePath) => {
          const content = await fs.readFile(filePath, 'utf-8');
          return {
            name: basename(filePath, extname(filePath)),
            path: filePath,
            content,
          };
        })
      );

      return { success: true, files };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // ==================== RECENT FILES ====================

  const recentFilesPath = join(userDataPath, 'recent-projects.json');

  ipcMain.handle('recent:get', async () => {
    try {
      if (existsSync(recentFilesPath)) {
        const content = await fs.readFile(recentFilesPath, 'utf-8');
        return JSON.parse(content);
      }
      return [];
    } catch {
      return [];
    }
  });

  ipcMain.handle('recent:add', async (_, projectPath: string, projectName: string) => {
    try {
      let recent: { path: string; name: string; timestamp: number }[] = [];
      if (existsSync(recentFilesPath)) {
        const content = await fs.readFile(recentFilesPath, 'utf-8');
        recent = JSON.parse(content);
      }

      // Remove existing entry if present
      recent = recent.filter(r => r.path !== projectPath);

      // Add to front
      recent.unshift({ path: projectPath, name: projectName, timestamp: Date.now() });

      // Keep only last 10
      recent = recent.slice(0, 10);

      await fs.writeFile(recentFilesPath, JSON.stringify(recent, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('recent:clear', async () => {
    try {
      await fs.writeFile(recentFilesPath, '[]');
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
