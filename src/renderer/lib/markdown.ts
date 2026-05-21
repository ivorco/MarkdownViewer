import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { rewriteImageSources } from './images'

marked.setOptions({ gfm: true, breaks: false })

export function renderMarkdown(content: string, markdownFilePath: string): string {
  const html = marked.parse(content, { async: false }) as string
  const sanitized = DOMPurify.sanitize(html)
  return rewriteImageSources(sanitized, markdownFilePath)
}
