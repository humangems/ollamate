import { ipcRenderer, contextBridge } from 'electron';
import { exposeElectronTRPC } from 'electron-trpc-experimental/preload';

// Expose tRPC bridge (uses window.electronTRPC namespace)
process.once('loaded', () => {
  exposeElectronTRPC();
});

// Keep legacy ipcRenderer bridge for settings IPC and fullscreen events
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  removeAllListeners(...args: Parameters<typeof ipcRenderer.removeAllListeners>) {
    const [channel] = args;
    return ipcRenderer.removeAllListeners(channel);
  },
});
