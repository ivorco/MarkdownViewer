import type { Tab } from '../lib/tabs'
import { getTabLabel } from '../lib/tabs'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onSelect: (tabId: string) => void
  onClose: (tabId: string) => void
}

export function TabBar({ tabs, activeTabId, onSelect, onClose }: TabBarProps): React.JSX.Element {
  return (
    <div className="tab-bar" role="tablist" aria-label="Open files">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        const label = getTabLabel(tab.filePath)

        return (
          <div
            key={tab.id}
            className={`tab${isActive ? ' tab--active' : ''}${tab.state.status === 'error' ? ' tab--error' : ''}`}
            role="tab"
            aria-selected={isActive}
          >
            <button type="button" className="tab__label" onClick={() => onSelect(tab.id)}>
              {label}
            </button>
            <button
              type="button"
              className="tab__close"
              aria-label={`Close ${label}`}
              onClick={() => onClose(tab.id)}
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
