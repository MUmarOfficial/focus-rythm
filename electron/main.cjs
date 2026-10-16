const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 720,
    minHeight: 560,
    resizable: true,
    minimizable: true,
    maximizable: true,
    frame: true,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const isDev = Boolean(process.env.VITE_DEV_SERVER_URL) || process.env.NODE_ENV === 'development';

  if (isDev) {
    const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(url);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers with strict type validation
ipcMain.handle('desktop:minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
    return true;
  }
  return false;
});

ipcMain.handle('desktop:setFullscreen', (event, fullscreen) => {
  if (typeof fullscreen !== 'boolean') {
    return false;
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setFullScreen(fullscreen);
    return true;
  }
  return false;
});

ipcMain.handle('desktop:notify', (event, payload) => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const title = typeof payload.title === 'string' ? payload.title : 'Focus Rhythm';
  const body = typeof payload.body === 'string' ? payload.body : '';

  if (Notification.isSupported()) {
    try {
      const notification = new Notification({
        title,
        body,
        silent: false
      });
      notification.show();
      return true;
    } catch (err) {
      console.error('Failed to display native notification:', err);
      return false;
    }
  }
  return false;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
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
