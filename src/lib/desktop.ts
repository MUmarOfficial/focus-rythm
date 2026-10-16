export interface DesktopBridge {
  minimizeWindow: () => Promise<boolean> | boolean | void;
  setFullscreen: (fullscreen: boolean) => Promise<boolean> | boolean | void;
  showNotification: (title: string, body: string) => Promise<boolean> | boolean | void;
}

declare global {
  interface Window {
    desktop?: DesktopBridge;
  }
}

const fallbackDesktop: DesktopBridge = {
  minimizeWindow: () => {
    // In browser or fallback environment, window minimizing is not natively available
    console.info('[desktop] minimizeWindow fallback invoked');
    return false;
  },
  setFullscreen: (fullscreen: boolean) => {
    console.info('[desktop] setFullscreen fallback invoked:', fullscreen);
    try {
      if (fullscreen) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return true;
    } catch {
      return false;
    }
  },
  showNotification: (title: string, body: string) => {
    console.info('[desktop] showNotification fallback invoked:', title, body);
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
          return true;
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(title, { body });
            }
          });
        }
      }
    } catch (err) {
      console.warn('[desktop] browser notification failed:', err);
    }
    return false;
  }
};

export const desktop: DesktopBridge = {
  minimizeWindow: () => {
    if (typeof window !== 'undefined' && window.desktop?.minimizeWindow) {
      return window.desktop.minimizeWindow();
    }
    return fallbackDesktop.minimizeWindow();
  },
  setFullscreen: (fullscreen: boolean) => {
    if (typeof window !== 'undefined' && window.desktop?.setFullscreen) {
      return window.desktop.setFullscreen(fullscreen);
    }
    return fallbackDesktop.setFullscreen(fullscreen);
  },
  showNotification: (title: string, body: string) => {
    if (typeof window !== 'undefined' && window.desktop?.showNotification) {
      return window.desktop.showNotification(title, body);
    }
    return fallbackDesktop.showNotification(title, body);
  }
};
