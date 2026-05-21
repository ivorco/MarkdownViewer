import type { MarkdownReadErrorCode } from '@shared/api'
import { useEffect, useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { ErrorState, getReadError } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { Viewer } from './components/Viewer'

type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; content: string; filePath: string }
  | { status: 'error'; message: string; code?: MarkdownReadErrorCode; filePath: string | null }

function App(): React.JSX.Element {
  const [state, setState] = useState<AppState>({ status: 'loading' })

  useEffect(() => {
    async function loadInitialFile(): Promise<void> {
      const filePath = window.markdownViewer.getInitialFilePath()

      if (!filePath) {
        setState({ status: 'idle' })
        return
      }

      try {
        const result = await window.markdownViewer.readMarkdownFile(filePath)
        document.title = `${result.filePath.split(/[/\\]/).pop()} — MarkdownViewer`
        setState({ status: 'ready', content: result.content, filePath: result.filePath })
      } catch (error) {
        const readError = getReadError(error)
        setState({
          status: 'error',
          message: readError.message,
          code: readError.code,
          filePath
        })
      }
    }

    void loadInitialFile()
  }, [])

  if (state.status === 'loading') {
    return <LoadingState />
  }

  if (state.status === 'idle') {
    return <EmptyState />
  }

  if (state.status === 'error') {
    return (
      <div className="app">
        <ErrorState
          message={state.message}
          code={state.code}
          filePath={state.filePath}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <Viewer content={state.content} filePath={state.filePath} />
    </div>
  )
}

export default App
