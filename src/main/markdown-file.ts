import { constants } from 'fs'
import { access, readFile, realpath } from 'fs/promises'
import path from 'path'

export type MarkdownReadErrorCode = 'NOT_FOUND' | 'NOT_MD' | 'PERMISSION' | 'READ_FAILED'

export class MarkdownReadError extends Error {
  readonly code: MarkdownReadErrorCode

  constructor(message: string, code: MarkdownReadErrorCode) {
    super(message)
    this.name = 'MarkdownReadError'
    this.code = code
  }
}

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown'])

export async function readMarkdownFile(
  filePath: string
): Promise<{ content: string; filePath: string }> {
  const resolved = path.resolve(filePath)
  const extension = path.extname(resolved).toLowerCase()

  if (!MARKDOWN_EXTENSIONS.has(extension)) {
    throw new MarkdownReadError('File is not a Markdown file.', 'NOT_MD')
  }

  let realPath: string

  try {
    realPath = await realpath(resolved)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code

    if (code === 'ENOENT') {
      throw new MarkdownReadError('File not found.', 'NOT_FOUND')
    }

    throw new MarkdownReadError('Cannot access file.', 'PERMISSION')
  }

  try {
    await access(realPath, constants.R_OK)
  } catch {
    throw new MarkdownReadError('Permission denied.', 'PERMISSION')
  }

  try {
    const content = await readFile(realPath, 'utf-8')
    return { content, filePath: realPath }
  } catch {
    throw new MarkdownReadError('Failed to read file.', 'READ_FAILED')
  }
}
