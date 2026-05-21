import { useMemo } from 'react'
import { renderMarkdown } from '../lib/markdown'

interface ViewerProps {
  content: string
  filePath: string
}

export function Viewer({ content, filePath }: ViewerProps): React.JSX.Element {
  const html = useMemo(() => renderMarkdown(content), [content])
  const fileName = filePath.split(/[/\\]/).pop() ?? filePath

  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    const anchor = (event.target as HTMLElement).closest('a')

    if (!anchor?.href) {
      return
    }

    event.preventDefault()
    void window.markdownViewer.openExternal(anchor.href)
  }

  return (
    <article className="viewer">
      <header className="viewer-header">
        <h1 className="viewer-title">{fileName}</h1>
        <p className="viewer-path" title={filePath}>
          {filePath}
        </p>
      </header>
      <main className="viewer-content">
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
          onClick={handleClick}
        />
      </main>
    </article>
  )
}
