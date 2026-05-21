export function EmptyState(): React.JSX.Element {
  return (
    <div className="app app--centered">
      <header className="app-header">
        <h1>MarkdownViewer</h1>
        <p className="app-subtitle">Open a Markdown file to get started.</p>
        <p className="app-hint">npm run dev:file README.md</p>
      </header>
    </div>
  )
}
