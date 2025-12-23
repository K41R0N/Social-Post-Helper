import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for the exposed API
export interface ElectronAPI {
  // Platform detection
  platform: NodeJS.Platform;
  isElectron: true;

  // File dialogs
  dialog: {
    openFile: (options?: {
      title?: string;
      filters?: { name: string; extensions: string[] }[];
      multiple?: boolean;
    }) => Promise<string[] | null>;
    saveFile: (options?: {
      title?: string;
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
    }) => Promise<string | null>;
    openFolder: (options?: {
      title?: string;
      defaultPath?: string;
    }) => Promise<string | null>;
  };

  // File system operations
  fs: {
    readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    readBinaryFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
    writeBinaryFile: (filePath: string, base64Data: string) => Promise<{ success: boolean; error?: string }>;
    deleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
    exists: (filePath: string) => Promise<boolean>;
    readDir: (dirPath: string) => Promise<{
      success: boolean;
      data?: { name: string; isDirectory: boolean; isFile: boolean }[];
      error?: string;
    }>;
    mkdir: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
    rmdir: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  };

  // App paths
  app: {
    getPath: (name: 'userData' | 'documents' | 'downloads' | 'home') => Promise<string>;
    getProjectsPath: () => Promise<string>;
    getTemplatesPath: () => Promise<string>;
    getFontsPath: () => Promise<string>;
  };

  // Shell operations
  shell: {
    openPath: (filePath: string) => Promise<string>;
    showItemInFolder: (filePath: string) => void;
    openExternal: (url: string) => Promise<void>;
  };

  // Export operations
  export: {
    saveSvg: (options: {
      svgContent: string;
      defaultName: string;
      projectPath?: string;
    }) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
    saveProjectFolder: (options: {
      projectName: string;
      carousels: {
        name: string;
        slides: { name: string; svgContent: string }[];
      }[];
    }) => Promise<{ success: boolean; exportPath?: string; canceled?: boolean; error?: string }>;
  };

  // Import operations
  import: {
    figmaSvg: () => Promise<{
      success: boolean;
      files?: { name: string; path: string; content: string }[];
      canceled?: boolean;
      error?: string;
    }>;
  };

  // Recent files
  recent: {
    get: () => Promise<{ path: string; name: string; timestamp: number }[]>;
    add: (projectPath: string, projectName: string) => Promise<{ success: boolean; error?: string }>;
    clear: () => Promise<{ success: boolean; error?: string }>;
  };

  // Menu event listeners
  onMenuEvent: (channel: string, callback: () => void) => () => void;
}

// Expose API to renderer
const electronAPI: ElectronAPI = {
  platform: process.platform,
  isElectron: true,

  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
    saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
    openFolder: (options) => ipcRenderer.invoke('dialog:openFolder', options),
  },

  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    readBinaryFile: (filePath) => ipcRenderer.invoke('fs:readBinaryFile', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    writeBinaryFile: (filePath, base64Data) => ipcRenderer.invoke('fs:writeBinaryFile', filePath, base64Data),
    deleteFile: (filePath) => ipcRenderer.invoke('fs:deleteFile', filePath),
    exists: (filePath) => ipcRenderer.invoke('fs:exists', filePath),
    readDir: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
    mkdir: (dirPath) => ipcRenderer.invoke('fs:mkdir', dirPath),
    rmdir: (dirPath) => ipcRenderer.invoke('fs:rmdir', dirPath),
  },

  app: {
    getPath: (name) => ipcRenderer.invoke('app:getPath', name),
    getProjectsPath: () => ipcRenderer.invoke('app:getProjectsPath'),
    getTemplatesPath: () => ipcRenderer.invoke('app:getTemplatesPath'),
    getFontsPath: () => ipcRenderer.invoke('app:getFontsPath'),
  },

  shell: {
    openPath: (filePath) => ipcRenderer.invoke('shell:openPath', filePath),
    showItemInFolder: (filePath) => ipcRenderer.invoke('shell:showItemInFolder', filePath),
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  },

  export: {
    saveSvg: (options) => ipcRenderer.invoke('export:saveSvg', options),
    saveProjectFolder: (options) => ipcRenderer.invoke('export:saveProjectFolder', options),
  },

  import: {
    figmaSvg: () => ipcRenderer.invoke('import:figmaSvg'),
  },

  recent: {
    get: () => ipcRenderer.invoke('recent:get'),
    add: (projectPath, projectName) => ipcRenderer.invoke('recent:add', projectPath, projectName),
    clear: () => ipcRenderer.invoke('recent:clear'),
  },

  onMenuEvent: (channel, callback) => {
    const subscription = (_event: Electron.IpcRendererEvent) => callback();
    ipcRenderer.on(channel, subscription);
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
};

// Expose in main world
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
