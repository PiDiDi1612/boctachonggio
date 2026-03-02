// electron/preload.js
// Preload script – bridge an toàn giữa Electron và renderer (web app)
// Context isolation ON → dùng contextBridge để expose API an toàn

const { contextBridge, ipcRenderer } = require('electron')

/**
 * Expose các API an toàn cho web app thông qua window.electronAPI
 * TODO: Mở rộng khi cần truy cập filesystem, in ấn, v.v.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /** Kiểm tra có đang chạy trong Electron không */
  isElectron: true,

  /** Lấy phiên bản app */
  getVersion: () => ipcRenderer.invoke('get-version'),

  /** Mở hộp thoại lưu file (TODO: dùng cho export Excel native) */
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  /** Lưu file xuống ổ cứng (mảng buffer) */
  saveFile: (filePath, buffer) => ipcRenderer.invoke('save-file', filePath, buffer),

  /** Gửi thông báo native (TODO) */
  showNotification: (title, body) =>
    ipcRenderer.invoke('show-notification', { title, body }),
})
