export interface MarkdownFileResult {
  content: string
  filePath: string
}

export type MarkdownReadErrorCode = 'NOT_FOUND' | 'NOT_MD' | 'PERMISSION' | 'READ_FAILED'

export interface MarkdownReadErrorPayload {
  code: MarkdownReadErrorCode
  message: string
}

export interface MarkdownViewerAPI {
  canonicalizeFilePath(filePath: string): Promise<string>
  readMarkdownFile(filePath: string): Promise<MarkdownFileResult>
  getInitialFilePath(): string | null
  onOpenFile(callback: (filePath: string) => void): () => void
  openExternal(url: string): Promise<void>
}

declare global {
  interface Window {
    markdownViewer: MarkdownViewerAPI
  }
}

export {}
