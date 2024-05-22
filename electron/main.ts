import { BrowserWindow, app, dialog, ipcMain } from 'electron'
// import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readMdFiles } from './readMdFile'

// const require = createRequire(import.meta.url) // require is not defined
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    titleBarStyle: 'hidden',
    width: 1100,
    height: 760,
    center: true,
    trafficLightPosition: { x: 18, y: 20 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.on('enter-full-screen', () => {
    win?.webContents.send('enter-full-screen-message', []);
  })

  win.on('leave-full-screen', () => {
    win?.webContents.send('leave-full-screen-message', []);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('open-directory-dialog', async (_event, _arg) => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ['openDirectory'],
  });

  if (result.canceled) {
    return;
  }

  const folder = result.filePaths[0];
  const pagesFolder = path.join(folder, 'pages');
  const journalsFolder = path.join(folder, 'journals');
  // iterate .md files in the folder
  readMdFiles(journalsFolder, false, (note) => {
    win?.webContents.send('import-note-message', note);
  });

  readMdFiles(pagesFolder, true, (note) => {
    win?.webContents.send('import-note-message', note);
  });

  return result.filePaths;
})

app.whenReady().then(createWindow)
