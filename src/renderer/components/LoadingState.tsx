export function LoadingState(): React.JSX.Element {
  return (
    <div className="app app--centered">
      <div className="loading-state" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="app-subtitle">Loading…</p>
      </div>
    </div>
  )
}
