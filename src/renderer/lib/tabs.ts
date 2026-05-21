import type { MarkdownReadErrorCode } from '@shared/api'

export interface TabError {
  message: string
  code?: MarkdownReadErrorCode
}

export type TabState =
  | { status: 'loading' }
  | { status: 'ready'; content: string; filePath: string }
  | { status: 'error'; filePath: string; error: TabError }

export interface Tab {
  id: string
  filePath: string
  state: TabState
}

export function getTabLabel(filePath: string): string {
  return filePath.split(/[/\\]/).pop() ?? filePath
}

export function updateDocumentTitle(tabs: Tab[], activeTabId: string | null): void {
  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  if (!activeTab || activeTab.state.status !== 'ready') {
    document.title = 'MarkdownViewer'
    return
  }

  document.title = `${getTabLabel(activeTab.state.filePath)} — MarkdownViewer`
}
