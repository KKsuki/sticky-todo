const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const DATA_DIR = 'D:\\sticky-todo'

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  const indexPath = path.join(DATA_DIR, 'index.json')
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, JSON.stringify({ dates: [], dataPath: DATA_DIR }, null, 2))
  }
}

function getDateStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getTodayFile() {
  return path.join(DATA_DIR, `${getDateStr()}.json`)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 360,
    height: 480,
    frame: false,
    transparent: false,
    resizable: true,
    minWidth: 300,
    minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  return win
}

app.whenReady().then(() => {
  ensureDataDir()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC Handlers
ipcMain.handle('get-today-todos', () => {
  const file = getTodayFile()
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  }
  return { date: getDateStr(), todos: [] }
})

ipcMain.handle('save-todos', (_event, data) => {
  const file = path.join(DATA_DIR, `${data.date}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))

  // Update index
  const indexPath = path.join(DATA_DIR, 'index.json')
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
  if (!index.dates.includes(data.date)) {
    index.dates.unshift(data.date)
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
  }
  return true
})

ipcMain.handle('get-history', () => {
  const indexPath = path.join(DATA_DIR, 'index.json')
  if (fs.existsSync(indexPath)) {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8')).dates
  }
  return []
})

ipcMain.handle('get-todos-by-date', (_event, date) => {
  const file = path.join(DATA_DIR, `${date}.json`)
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  }
  return { date, todos: [] }
})

ipcMain.handle('window-minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

ipcMain.handle('window-close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})
