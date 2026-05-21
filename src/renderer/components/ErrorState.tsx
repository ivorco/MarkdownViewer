import type { MarkdownReadErrorPayload } from '@shared/api'

interface ErrorStateProps {
  message: string
  filePath?: string | null
}

export function ErrorState({ message, filePath }: ErrorStateProps): React.JSX.Element {
  return (
    <div className="error-state" role="alert">
      <h1>Unable to open file</h1>
      <p>{message}</p>
      {filePath ? <p className="error-path">{filePath}</p> : null}
    </div>
  )
}

export function getReadErrorMessage(error: unknown): string {
  if (isMarkdownReadError(error)) {
    return error.message
  }

  return 'Failed to read file.'
}

function isMarkdownReadError(error: unknown): error is MarkdownReadErrorPayload {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as MarkdownReadErrorPayload).message === 'string'
  )
}
