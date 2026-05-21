import type { MarkdownReadErrorCode, MarkdownReadErrorPayload } from '@shared/api'

interface ErrorStateProps {
  message: string
  code?: MarkdownReadErrorCode
  filePath?: string | null
}

const ERROR_HINTS: Record<MarkdownReadErrorCode, string> = {
  NOT_FOUND: 'Check that the path is correct and the file exists.',
  NOT_MD: 'Only .md and .markdown files can be opened.',
  PERMISSION: 'Check file permissions and try again.',
  READ_FAILED: 'The file could not be read. It may be locked or corrupted.'
}

export function ErrorState({ message, code, filePath }: ErrorStateProps): React.JSX.Element {
  const hint = code ? ERROR_HINTS[code] : undefined

  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">
        !
      </div>
      <h1 className="error-state__title">Unable to open file</h1>
      <p className="error-state__message">{message}</p>
      {hint ? <p className="error-state__hint">{hint}</p> : null}
      {filePath ? <p className="error-state__path">{filePath}</p> : null}
    </div>
  )
}

export interface ReadErrorInfo {
  message: string
  code?: MarkdownReadErrorCode
}

export function getReadError(error: unknown): ReadErrorInfo {
  if (isMarkdownReadError(error)) {
    return { message: error.message, code: error.code }
  }

  return { message: 'Failed to read file.' }
}

function isMarkdownReadError(error: unknown): error is MarkdownReadErrorPayload {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as MarkdownReadErrorPayload).message === 'string'
  )
}
