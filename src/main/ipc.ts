import { ipcMain, shell } from 'electron'
import { MarkdownReadError, canonicalizeFilePath, readMarkdownFile } from './markdown-file'

const windowInitialPaths = new Map<number, string>()

export function setWindowInitialFilePath(webContentsId: number, filePath: string): void {
  windowInitialPaths.set(webContentsId, filePath)
}

export function clearWindowInitialFilePath(webContentsId: number): void {
  windowInitialPaths.delete(webContentsId)
}

function takeWindowInitialFilePath(webContentsId: number): string | null {
  const filePath = windowInitialPaths.get(webContentsId) ?? null
  windowInitialPaths.delete(webContentsId)
  return filePath
}

export function registerIpcHandlers(): void {
  ipcMain.handle('canonicalize-file-path', async (_event, filePath: string) => {
    return canonicalizeFilePath(filePath)
  })

  ipcMain.handle('read-markdown-file', async (_event, filePath: string) => {
    try {
      return await readMarkdownFile(filePath)
    } catch (error) {
      if (error instanceof MarkdownReadError) {
        throw { code: error.code, message: error.message }
      }

      throw { code: 'READ_FAILED' as const, message: 'Failed to read file.' }
    }
  })

  ipcMain.on('get-initial-file-path', (event) => {
    event.returnValue = takeWindowInitialFilePath(event.sender.id)
  })

  ipcMain.handle('open-external', async (_event, url: string) => {
    await shell.openExternal(url)
  })
}
