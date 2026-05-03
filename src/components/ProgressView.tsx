import { CheckCircle, Circle, Loader } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import type { PhaseStatus } from '../types'

function PhaseIcon({ status }: { status: PhaseStatus }) {
  if (status === 'complete')
    return <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--success)' }} />
  if (status === 'running')
    return (
      <Loader
        className="w-5 h-5 flex-shrink-0 animate-spin"
        style={{ color: 'var(--accent)' }}
      />
    )
  return <Circle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--border)' }} />
}

export default function ProgressView() {
  const { phases } = useAppStore()

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-2">Generating your cover letter</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        This takes about 30–60 seconds.
      </p>

      <div className="space-y-4">
        {phases.map((phase, i) => (
          <div key={phase.id} className="flex items-center gap-3">
            <PhaseIcon status={phase.status} />
            <span
              className="text-sm font-medium"
              style={{
                color:
                  phase.status === 'running'
                    ? 'var(--accent)'
                    : phase.status === 'complete'
                    ? 'var(--success)'
                    : 'var(--muted)',
              }}
            >
              {i + 1}. {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
