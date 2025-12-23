import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { setupIpcHandlers } from './ipc';
import { createMenu } from './menu';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Ensure user data directory exists
const userDataPath = app.getPath('userData');
const projectsPath = join(userDataPath, 'projects');
const templatesPath = join(userDataPath, 'templates');
const fontsPath = join(userDataPath, 'fonts');

[projectsPath, templatesPath, fontsPath].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: false,
    title: 'Go Round',
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Create application menu
  const menu = createMenu(mainWindow);
  Menu.setApplicationMenu(menu);

  // Show window when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../renderer/index.html'));
  }
}

// Set up IPC handlers before window is created
setupIpcHandlers();

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Export paths for IPC handlers
export { userDataPath, projectsPath, templatesPath, fontsPath };
