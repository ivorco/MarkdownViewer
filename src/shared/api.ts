export interface MarkdownFileResult {
  content: string
  filePath: string
}

export interface MarkdownViewerAPI {
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
