import { Menu, BrowserWindow, app, shell, dialog } from 'electron';

export function createMenu(mainWindow: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu:newProject');
          },
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu:openProject');
          },
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu:save');
          },
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu:saveAs');
          },
        },
        { type: 'separator' },
        {
          label: 'Import',
          submenu: [
            {
              label: 'Import CSV...',
              click: () => {
                mainWindow.webContents.send('menu:importCsv');
              },
            },
            {
              label: 'Import Figma SVG...',
              click: () => {
                mainWindow.webContents.send('menu:importFigma');
              },
            },
          ],
        },
        {
          label: 'Export',
          submenu: [
            {
              label: 'Export as SVG...',
              accelerator: 'CmdOrCtrl+E',
              click: () => {
                mainWindow.webContents.send('menu:exportSvg');
              },
            },
            {
              label: 'Export as PNG...',
              click: () => {
                mainWindow.webContents.send('menu:exportPng');
              },
            },
            {
              label: 'Export All to Folder...',
              accelerator: 'CmdOrCtrl+Shift+E',
              click: () => {
                mainWindow.webContents.send('menu:exportFolder');
              },
            },
            { type: 'separator' },
            {
              label: 'Export CSV...',
              click: () => {
                mainWindow.webContents.send('menu:exportCsv');
              },
            },
          ],
        },
        { type: 'separator' },
        {
          label: 'Recent Projects',
          id: 'recent',
          submenu: [
            { label: 'No Recent Projects', enabled: false },
          ],
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const },
              { role: 'delete' as const },
              { role: 'selectAll' as const },
            ]
          : [
              { role: 'delete' as const },
              { type: 'separator' as const },
              { role: 'selectAll' as const },
            ]),
      ],
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    // Slide menu
    {
      label: 'Slide',
      submenu: [
        {
          label: 'Add Slide',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow.webContents.send('menu:addSlide');
          },
        },
        {
          label: 'Duplicate Slide',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('menu:duplicateSlide');
          },
        },
        {
          label: 'Delete Slide',
          accelerator: 'Backspace',
          click: () => {
            mainWindow.webContents.send('menu:deleteSlide');
          },
        },
        { type: 'separator' },
        {
          label: 'Previous Slide',
          accelerator: 'Left',
          click: () => {
            mainWindow.webContents.send('menu:prevSlide');
          },
        },
        {
          label: 'Next Slide',
          accelerator: 'Right',
          click: () => {
            mainWindow.webContents.send('menu:nextSlide');
          },
        },
      ],
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const },
            ]
          : [{ role: 'close' as const }]),
      ],
    },

    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Go Round Documentation',
          click: async () => {
            await shell.openExternal('https://goround.dev/docs');
          },
        },
        {
          label: 'Report an Issue',
          click: async () => {
            await shell.openExternal('https://github.com/goround/goround/issues');
          },
        },
        { type: 'separator' },
        {
          label: 'About Go Round',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Go Round',
              message: 'Go Round',
              detail: `Version: ${app.getVersion()}\n\nCreate beautiful social media carousels with bulk generation and Figma integration.`,
            });
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
