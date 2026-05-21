import { useEffect, useState } from 'react'
import { ErrorState, getReadErrorMessage } from './components/ErrorState'
import { Viewer } from './components/Viewer'

type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; content: string; filePath: string }
  | { status: 'error'; message: string; filePath: string | null }

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
        setState({
          status: 'error',
          message: getReadErrorMessage(error),
          filePath
        })
      }
    }

    void loadInitialFile()
  }, [])

  if (state.status === 'loading') {
    return (
      <div className="app app--centered">
        <p className="app-subtitle">Loading…</p>
      </div>
    )
  }

  if (state.status === 'idle') {
    return (
      <div className="app app--centered">
        <header className="app-header">
          <h1>MarkdownViewer</h1>
          <p className="app-subtitle">Open a Markdown file to get started.</p>
          <p className="app-hint">Example: npm run dev:file README.md</p>
        </header>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="app">
        <ErrorState message={state.message} filePath={state.filePath} />
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
