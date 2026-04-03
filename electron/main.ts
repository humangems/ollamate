import { BrowserWindow, app, ipcMain } from 'electron';
import { createIPCHandler } from 'electron-trpc-experimental/main';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './setting-store';
import { settingStore } from './setting-store';
import { appRouter } from './api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    titleBarStyle: 'hidden',
    width: 1100,
    height: 760,
    center: true,
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: false,
    },
  });

  createIPCHandler({ router: appRouter, windows: [win] });

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  win.on('enter-full-screen', () => {
    win?.webContents.send('enter-full-screen-message', []);
  });

  win.on('leave-full-screen', () => {
    win?.webContents.send('leave-full-screen-message', []);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('setting-set', async (_event, key, value) => {
  await settingStore.set(key, value);
});

ipcMain.handle('setting-get', async (_event, key) => {
  return await settingStore.get(key);
});

app.whenReady().then(createWindow);
