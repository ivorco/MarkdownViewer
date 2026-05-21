import { app, BrowserWindow } from 'electron'
import { getFilePathFromArgv, getStartupFilePath } from './argv'
import { registerIpcHandlers } from './ipc'
import { createWindow, focusExistingWindow, openMarkdownFile } from './windows'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  let pendingOpenFilePath: string | null = null

  app.on('second-instance', (_event, argv) => {
    const filePath = getFilePathFromArgv(argv)

    if (filePath) {
      openMarkdownFile(filePath)
      return
    }

    focusExistingWindow()
  })

  app.on('open-file', (event, filePath) => {
    event.preventDefault()

    if (app.isReady()) {
      openMarkdownFile(filePath)
      return
    }

    pendingOpenFilePath = filePath
  })

  app.whenReady().then(() => {
    registerIpcHandlers()

    const startupPath = getStartupFilePath(process.argv, pendingOpenFilePath)
    createWindow(startupPath)
    pendingOpenFilePath = null

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
}
