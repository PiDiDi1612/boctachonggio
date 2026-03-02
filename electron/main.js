// electron/main.js
// Electron main process – wraps Next.js web app thành desktop app

const { app, BrowserWindow, shell, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged
const DEV_URL = 'http://localhost:3000'

/**
 * Tạo cửa sổ chính của ứng dụng
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'DuctPro – Bóc Tách Ống Gió Pro',
    // icon: path.join(__dirname, '../public/icon.png'), // Bỏ comment khi có icon
    webPreferences: {
      nodeIntegration: false,        // Tắt để bảo mật
      contextIsolation: true,        // Bật context isolation
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#0d0f14',     // Match màu nền app (tránh flash trắng)
    show: false,                     // Ẩn cho đến khi ready-to-show
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  })

  // Load app
  if (isDev) {
    win.loadURL(DEV_URL)
    win.webContents.openDevTools()
  } else {
    // Production: load từ Next.js output
    win.loadURL(`file://${path.join(__dirname, '../.next/server/app/index.html')}`)
    // Hoặc dùng next-electron-server package cho production
  }

  // Hiện cửa sổ khi đã render xong (tránh flash)
  win.once('ready-to-show', () => {
    win.show()
  })

  // Mở link ngoài bằng browser mặc định thay vì Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  return win
}

/**
 * Tạo application menu (macOS)
 */
function createMenu() {
  const template = [
    {
      label: 'DuctPro',
      submenu: [
        { label: 'Về DuctPro', role: 'about' },
        { type: 'separator' },
        { label: 'Thoát', role: 'quit' },
      ],
    },
    {
      label: 'Chỉnh sửa',
      submenu: [
        { label: 'Hoàn tác', role: 'undo' },
        { label: 'Làm lại', role: 'redo' },
        { type: 'separator' },
        { label: 'Cắt', role: 'cut' },
        { label: 'Sao chép', role: 'copy' },
        { label: 'Dán', role: 'paste' },
      ],
    },
    {
      label: 'Xem',
      submenu: [
        { label: 'Tải lại', role: 'reload' },
        { label: 'Phóng to', role: 'togglefullscreen' },
        ...(isDev ? [{ label: 'DevTools', role: 'toggleDevTools' }] : []),
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()
  createMenu()

  ipcMain.handle('show-save-dialog', async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return await dialog.showSaveDialog(win, options)
  })

  ipcMain.handle('save-file', async (event, filePath, buffer) => {
    try {
      fs.writeFileSync(filePath, Buffer.from(buffer))
      return { success: true }
    } catch (err) {
      console.error('Lỗi khi ghi file:', err)
      return { success: false, error: err.message }
    }
  })

  // macOS: tạo lại cửa sổ khi click vào dock icon
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // macOS giữ app chạy khi đóng hết cửa sổ
  if (process.platform !== 'darwin') app.quit()
})
