import { ipcMain, shell } from 'electron'
import { getFilePathFromArgv } from './argv'
import { MarkdownReadError, readMarkdownFile } from './markdown-file'

let initialFilePath: string | null = getFilePathFromArgv()

export function getInitialFilePath(): string | null {
  return initialFilePath
}

export function registerIpcHandlers(): void {
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
    event.returnValue = initialFilePath
  })

  ipcMain.handle('open-external', async (_event, url: string) => {
    await shell.openExternal(url)
  })
}
