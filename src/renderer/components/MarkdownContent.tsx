import { useMemo } from 'react'
import { renderMarkdown } from '../lib/markdown'

interface MarkdownContentProps {
  content: string
  filePath: string
}

export function MarkdownContent({ content, filePath }: MarkdownContentProps): React.JSX.Element {
  const html = useMemo(() => renderMarkdown(content), [content])

  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    const anchor = (event.target as HTMLElement).closest('a')

    if (!anchor?.href) {
      return
    }

    event.preventDefault()
    void window.markdownViewer.openExternal(anchor.href)
  }

  return (
    <main className="viewer-content">
      <p className="viewer-path viewer-path--content" title={filePath}>
        {filePath}
      </p>
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleClick}
      />
    </main>
  )
}
