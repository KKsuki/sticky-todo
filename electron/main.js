const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// 优先使用 D 盘，如果不可用则回退到用户数据目录
let DATA_DIR = 'D:\\sticky-todo'
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  console.log('[main] 数据目录:', DATA_DIR)
} catch (e) {
  console.warn('[main] D盘不可用，回退到 userData:', e.message)
  DATA_DIR = path.join(app.getPath('userData'), 'sticky-todo')
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  console.log('[main] 数据目录(回退):', DATA_DIR)
}

function ensureIndexFile() {
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

// 获取月份文件夹名称，如 "2026年5月"
function getMonthFolder(dateStr) {
  const [year, month] = dateStr.split('-')
  return `${year}年${parseInt(month)}月`
}

// 获取某天的数据文件路径
function getDateFile(dateStr) {
  const folder = getMonthFolder(dateStr)
  const folderPath = path.join(DATA_DIR, folder)
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
  return path.join(folderPath, `${dateStr}.json`)
}

function getTodayFile() {
  return getDateFile(getDateStr())
}

// 数据迁移：将旧格式文件迁移到新文件夹结构
function migrateData() {
  const files = fs.readdirSync(DATA_DIR)
  const datePattern = /^\d{4}-\d{2}-\d{2}\.json$/
  let migratedCount = 0

  files.forEach(file => {
    if (datePattern.test(file)) {
      const dateStr = file.replace('.json', '')
      const oldPath = path.join(DATA_DIR, file)
      const newPath = getDateFile(dateStr)

      if (!fs.existsSync(newPath)) {
        const data = JSON.parse(fs.readFileSync(oldPath, 'utf-8'))
        fs.writeFileSync(newPath, JSON.stringify(data, null, 2))
        fs.unlinkSync(oldPath)
        migratedCount++
      }
    }
  })

  if (migratedCount > 0) {
    console.log(`[main] 迁移了 ${migratedCount} 个数据文件`)
  }

  // 更新 index.json，重建日期列表
  rebuildIndex()
}

// 重建索引
function rebuildIndex() {
  const dates = []
  const folders = fs.readdirSync(DATA_DIR)

  folders.forEach(folder => {
    const folderPath = path.join(DATA_DIR, folder)
    if (fs.statSync(folderPath).isDirectory() && folder.includes('年')) {
      const files = fs.readdirSync(folderPath)
      files.forEach(file => {
        if (file.endsWith('.json') && /^\d{4}-\d{2}-\d{2}\.json$/.test(file)) {
          dates.push(file.replace('.json', ''))
        }
      })
    }
  })

  dates.sort((a, b) => b.localeCompare(a))
  const indexPath = path.join(DATA_DIR, 'index.json')
  fs.writeFileSync(indexPath, JSON.stringify({ dates, dataPath: DATA_DIR }, null, 2))
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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('[main] 加载开发服务器:', process.env.VITE_DEV_SERVER_URL)
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = path.join(app.getAppPath(), 'build', 'index.html')
    console.log('[main] app路径:', app.getAppPath())
    console.log('[main] 加载文件:', indexPath)
    console.log('[main] 文件存在:', fs.existsSync(indexPath))
    win.loadFile(indexPath).catch(err => {
      console.error('[main] loadFile 失败:', err)
    })
  }

  win.once('ready-to-show', () => {
    console.log('[main] 页面加载完成，显示窗口')
    win.show()
  })

  win.webContents.on('did-fail-load', (_event, errorCode, errorDesc, validatedURL) => {
    console.error('[main] 页面加载失败:', { errorCode, errorDesc, validatedURL })
  })

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[main] 渲染进程崩溃:', details)
  })

  win.webContents.on('did-finish-load', () => {
    console.log('[main] did-finish-load 触发')
  })

  return win
}

// 全局错误捕获
process.on('uncaughtException', (err) => {
  console.error('[main] 未捕获异常:', err)
})

app.whenReady().then(() => {
  console.log('[main] app ready')
  ensureIndexFile()
  migrateData()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch(err => {
  console.error('[main] app.whenReady 失败:', err)
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
  const file = getDateFile(data.date)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))

  const indexPath = path.join(DATA_DIR, 'index.json')
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
  if (!index.dates.includes(data.date)) {
    index.dates.unshift(data.date)
    index.dates.sort((a, b) => b.localeCompare(a))
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
  const file = getDateFile(date)
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

// 获取某个月份有待办的日期列表
ipcMain.handle('get-month-dates', (_event, yearMonth) => {
  // yearMonth 格式: "2026年5月"
  const folderPath = path.join(DATA_DIR, yearMonth)
  const dates = []

  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath)
    files.forEach(file => {
      if (file.endsWith('.json') && /^\d{4}-\d{2}-\d{2}\.json$/.test(file)) {
        const filePath = path.join(folderPath, file)
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (data.todos && data.todos.length > 0) {
          dates.push(file.replace('.json', ''))
        }
      }
    })
  }

  return dates
})

// Memo handlers
function getMemosFile() {
  return path.join(DATA_DIR, 'memos.json')
}

ipcMain.handle('get-memos', () => {
  const file = getMemosFile()
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  }
  return { memos: [] }
})

ipcMain.handle('save-memos', (_event, data) => {
  const file = getMemosFile()
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  return true
})
