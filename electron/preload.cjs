const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  minimizeWindow: () => {
    return ipcRenderer.invoke('desktop:minimize');
  },
  setFullscreen: (fullscreen) => {
    return ipcRenderer.invoke('desktop:setFullscreen', Boolean(fullscreen));
  },
  showNotification: (title, body) => {
    return ipcRenderer.invoke('desktop:notify', {
      title: String(title ?? ''),
      body: String(body ?? '')
    });
  }
});
