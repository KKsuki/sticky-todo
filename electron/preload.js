const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getTodayTodos: () => ipcRenderer.invoke('get-today-todos'),
  saveTodos: (data) => ipcRenderer.invoke('save-todos', data),
  getHistory: () => ipcRenderer.invoke('get-history'),
  getTodosByDate: (date) => ipcRenderer.invoke('get-todos-by-date', date),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
})
