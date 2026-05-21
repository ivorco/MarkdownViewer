/// <reference types="vite/client" />

import type { MarkdownViewerAPI } from '@shared/api'

declare global {
  interface Window {
    markdownViewer: MarkdownViewerAPI
  }
}

export {}
