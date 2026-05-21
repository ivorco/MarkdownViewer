import type { MarkdownReadErrorCode } from '@shared/api'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { ErrorState, getReadError } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { MarkdownContent } from './components/MarkdownContent'
import { TabBar } from './components/TabBar'
import { type Tab, updateDocumentTitle } from './lib/tabs'

function App(): React.JSX.Element {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const tabsRef = useRef<Tab[]>([])
  const openingRef = useRef(new Set<string>())

  tabsRef.current = tabs

  const focusTab = useCallback((tabId: string, currentTabs: Tab[]) => {
    setActiveTabId(tabId)
    updateDocumentTitle(currentTabs, tabId)
  }, [])

  const openFile = useCallback(
    async (filePath: string) => {
      const canonicalPath = await window.markdownViewer.canonicalizeFilePath(filePath)
      const existingTab = tabsRef.current.find((tab) => tab.id === canonicalPath)

      if (existingTab) {
        focusTab(existingTab.id, tabsRef.current)
        return
      }

      if (openingRef.current.has(canonicalPath)) {
        setActiveTabId(canonicalPath)
        return
      }

      openingRef.current.add(canonicalPath)

      setTabs((currentTabs) => [
        ...currentTabs,
        {
          id: canonicalPath,
          filePath: canonicalPath,
          state: { status: 'loading' }
        }
      ])
      setActiveTabId(canonicalPath)

      try {
        const result = await window.markdownViewer.readMarkdownFile(filePath)

        setTabs((currentTabs) => {
          const nextTabs = currentTabs.map((tab) =>
            tab.id === canonicalPath
              ? {
                  ...tab,
                  filePath: result.filePath,
                  state: {
                    status: 'ready' as const,
                    content: result.content,
                    filePath: result.filePath
                  }
                }
              : tab
          )

          updateDocumentTitle(nextTabs, canonicalPath)
          return nextTabs
        })
      } catch (error) {
        const readError = getReadError(error)

        setTabs((currentTabs) =>
          currentTabs.map((tab) =>
            tab.id === canonicalPath
              ? {
                  ...tab,
                  state: {
                    status: 'error' as const,
                    filePath: canonicalPath,
                    error: {
                      message: readError.message,
                      code: readError.code as MarkdownReadErrorCode | undefined
                    }
                  }
                }
              : tab
          )
        )
      } finally {
        openingRef.current.delete(canonicalPath)
      }
    },
    [focusTab]
  )

  useEffect(() => {
    async function loadInitialFile(): Promise<void> {
      const filePath = window.markdownViewer.getInitialFilePath()

      if (filePath) {
        await openFile(filePath)
      }

      setInitializing(false)
    }

    void loadInitialFile()
  }, [openFile])

  useEffect(() => {
    return window.markdownViewer.onOpenFile((filePath) => {
      void openFile(filePath)
    })
  }, [openFile])

  const handleSelectTab = useCallback(
    (tabId: string) => {
      focusTab(tabId, tabsRef.current)
    },
    [focusTab]
  )

  const handleCloseTab = useCallback(
    (tabId: string) => {
      setTabs((currentTabs) => {
        const tabIndex = currentTabs.findIndex((tab) => tab.id === tabId)
        const nextTabs = currentTabs.filter((tab) => tab.id !== tabId)

        if (activeTabId === tabId) {
          const nextActiveTab = nextTabs[Math.min(tabIndex, nextTabs.length - 1)] ?? null
          setActiveTabId(nextActiveTab?.id ?? null)
          updateDocumentTitle(nextTabs, nextActiveTab?.id ?? null)
        }

        return nextTabs
      })
    },
    [activeTabId]
  )

  if (initializing) {
    return <LoadingState />
  }

  if (tabs.length === 0) {
    return <EmptyState />
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[tabs.length - 1]

  return (
    <div className="app app--tabs">
      <TabBar
        tabs={tabs}
        activeTabId={activeTab.id}
        onSelect={handleSelectTab}
        onClose={handleCloseTab}
      />

      {activeTab.state.status === 'loading' ? (
        <div className="tab-panel tab-panel--centered">
          <LoadingState />
        </div>
      ) : null}

      {activeTab.state.status === 'error' ? (
        <div className="tab-panel">
          <ErrorState
            message={activeTab.state.error.message}
            code={activeTab.state.error.code}
            filePath={activeTab.state.filePath}
          />
        </div>
      ) : null}

      {activeTab.state.status === 'ready' ? (
        <div className="tab-panel" role="tabpanel">
          <MarkdownContent content={activeTab.state.content} filePath={activeTab.state.filePath} />
        </div>
      ) : null}
    </div>
  )
}

export default App
