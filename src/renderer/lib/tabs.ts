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

  if (!activeTab) {
    document.title = 'MarkdownViewer'
    return
  }

  const label = getTabLabel(
    activeTab.state.status === 'ready' ? activeTab.state.filePath : activeTab.filePath
  )

  if (activeTab.state.status === 'ready') {
    document.title = `${label} — MarkdownViewer`
    return
  }

  if (activeTab.state.status === 'loading') {
    document.title = `Loading ${label} — MarkdownViewer`
    return
  }

  document.title = `${label} — MarkdownViewer`
}
