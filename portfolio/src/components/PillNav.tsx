import type { DestKey } from '../content'
import { NAV_DESTS } from '../content'

interface PillNavProps {
  active: DestKey
  onNavigate: (key: DestKey) => void
  onRepulsionSuppressed: (suppressed: boolean) => void
}

export function PillNav({ active, onNavigate, onRepulsionSuppressed }: PillNavProps) {
  return (
    <header
      className="nav"
      onMouseEnter={() => onRepulsionSuppressed(true)}
      onMouseLeave={() => onRepulsionSuppressed(false)}
      onFocus={() => onRepulsionSuppressed(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onRepulsionSuppressed(false)
        }
      }}
    >
      <nav className="nav-items" aria-label="Portfolio sections">
        {NAV_DESTS.map((dest) => (
          <button
            key={dest.key}
            type="button"
            className="nav-item"
            aria-current={active === dest.key ? 'true' : undefined}
            onClick={() => onNavigate(dest.key)}
          >
            {dest.label}
          </button>
        ))}
      </nav>
    </header>
  )
}