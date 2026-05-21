import { contextBridge, ipcRenderer } from 'electron'
import type { MarkdownViewerAPI } from '../shared/api'

const api: MarkdownViewerAPI = {
  readMarkdownFile: (filePath) => ipcRenderer.invoke('read-markdown-file', filePath),
  getInitialFilePath: () => ipcRenderer.sendSync('get-initial-file-path') as string | null,
  onOpenFile: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, filePath: string): void => {
      callback(filePath)
    }

    ipcRenderer.on('open-file', listener)

    return () => {
      ipcRenderer.removeListener('open-file', listener)
    }
  },
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
}

contextBridge.exposeInMainWorld('markdownViewer', api)
