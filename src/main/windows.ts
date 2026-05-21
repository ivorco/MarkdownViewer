import { app, BrowserWindow, nativeImage, shell } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'
import { clearWindowInitialFilePath, setWindowInitialFilePath } from './ipc'

const isDev = !app.isPackaged

function getWindowIcon(): Electron.NativeImage | undefined {
  const iconPaths = [
    join(app.getAppPath(), 'assets', 'icon.png'),
    join(process.resourcesPath, 'icon.png')
  ]

  for (const iconPath of iconPaths) {
    if (existsSync(iconPath)) {
      return nativeImage.createFromPath(iconPath)
    }
  }

  return undefined
}

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows().filter((window) => !window.isDestroyed())
  return windows[0] ?? null
}

function focusWindow(window: BrowserWindow): void {
  if (window.isDestroyed()) {
    return
  }

  if (window.isMinimized()) {
    window.restore()
  }

  window.focus()
}

export function createWindow(filePath?: string | null): BrowserWindow {
  const icon = getWindowIcon()
  const window = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 480,
    minHeight: 360,
    show: false,
    autoHideMenuBar: true,
    title: 'MarkdownViewer',
    ...(icon ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const webContentsId = window.webContents.id

  if (filePath) {
    setWindowInitialFilePath(webContentsId, filePath)
  }

  window.on('closed', () => {
    clearWindowInitialFilePath(webContentsId)
  })

  window.on('ready-to-show', () => {
    if (!window.isDestroyed()) {
      window.show()
    }
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    void window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

export function openMarkdownFile(filePath: string): void {
  const existingWindow = getMainWindow()

  if (existingWindow) {
    const sendOpenFile = (): void => {
      if (!existingWindow.isDestroyed()) {
        existingWindow.webContents.send('open-file', filePath)
      }
    }

    if (existingWindow.webContents.isLoading()) {
      existingWindow.webContents.once('did-finish-load', sendOpenFile)
    } else {
      sendOpenFile()
    }

    focusWindow(existingWindow)
    return
  }

  createWindow(filePath)
}

export function focusExistingWindow(): void {
  const window = getMainWindow()

  if (!window) {
    createWindow()
    return
  }

  focusWindow(window)
}
