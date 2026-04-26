import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron'
import { join, dirname, extname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { promises as fs } from 'fs'
import { parseFile } from 'music-metadata'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { bypassCSP: true, supportFetchAPI: true, stream: true, secure: true, standard: true } }
])

let mainWindow

function createWindow() {
  console.log("--- MONOKERNAL SYSTEM STARTING [BUILD_ID: 2026_04_25_V2] ---");
  const preloadPath = join(__dirname, 'preload.cjs');

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false, // Frameless window
    icon: join(__dirname, app.isPackaged ? '../dist/icon.ico' : '../assets/icon.ico'),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (!app.isPackaged && process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
    // mainWindow.webContents.openDevTools() // Debugging finished
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Global IPC Handlers (Outside createWindow for stability)
ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close()
})

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

// Handle folder selection
ipcMain.removeHandler('dialog:selectFolder')
ipcMain.handle('dialog:selectFolder', async () => {
  console.log("[MAIN] Received dialog:selectFolder request");
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow || null, {
      properties: ['openDirectory', 'showHiddenFiles'],
      title: 'SELECT AUDIO DIRECTORY'
    })
    console.log("[MAIN] Dialog result:", { canceled, path: filePaths[0] });
    return canceled ? null : filePaths[0]
  } catch (error) {
    console.error("[MAIN] Dialog error:", error);
    dialog.showErrorBox('SYSTEM_ERROR: SELECT_FOLDER_FAILED', error.message)
    return null
  }
})

// Handle scanning a folder for audio files
ipcMain.handle('music:scanFolder', async (event, folderPath) => {
  try {
    const audioExtensions = new Set(['.mp3', '.flac', '.wav', '.m4a', '.ogg', '.wma', '.aac'])
    const results = []

    async function walkDir(currentPath) {
      const entries = await fs.readdir(currentPath, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name)
        if (entry.isDirectory()) {
          await walkDir(fullPath)
        } else if (entry.isFile() && audioExtensions.has(extname(entry.name).toLowerCase())) {
          try {
            const metadata = await parseFile(fullPath)
            
            let pictureDataUri = null;
            if (metadata.common.picture && metadata.common.picture.length > 0) {
              const picture = metadata.common.picture[0];
              const base64 = picture.data.toString('base64');
              pictureDataUri = `data:${picture.format};base64,${base64}`;
            }

            results.push({
              path: fullPath,
              title: metadata.common.title || entry.name,
              artist: metadata.common.artist || 'Unknown Artist',
              album: metadata.common.album || 'Unknown Album',
              year: metadata.common.year || '',
              duration: metadata.format.duration || 0,
              picture: pictureDataUri
            })
          } catch (err) {
            console.error(`Error parsing ${fullPath}:`, err.message)
          }
        }
      }
    }

    await walkDir(folderPath)
    return results
  } catch (err) {
    dialog.showErrorBox('SYSTEM_ERROR: SCAN_FAILED', err.message)
    throw err
  }
})

ipcMain.handle('dialog:selectImage', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Playlist Cover Image',
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'] }],
    properties: ['openFile']
  })
  if (canceled || filePaths.length === 0) return null
  const imgPath = filePaths[0]
  const ext = extname(imgPath).toLowerCase().replace('.', '')
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', bmp: 'image/bmp', gif: 'image/gif' }
  const mime = mimeMap[ext] || 'image/png'
  const data = await fs.readFile(imgPath)
  return `data:${mime};base64,${data.toString('base64')}`
})

app.whenReady().then(() => {
  protocol.registerFileProtocol('media', (request, callback) => {
    let url = request.url.replace('media://local/', '')
    if (url.endsWith('/')) {
      url = url.slice(0, -1)
    }
    const decodedPath = decodeURIComponent(url)
    callback({ path: decodedPath })
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
