import { useAppStore } from './stores/appStore'
import { LogoMark } from './components/Illos'
import UploadStep from './components/UploadStep'
import VacancyStep from './components/VacancyStep'
import ProgressView from './components/ProgressView'
import ResultView from './components/ResultView'
import HistoryView from './components/HistoryView'

const NAV_ITEMS = [
  { n: 1, label: 'CV' },
  { n: 2, label: 'Vacancy' },
  { n: 3, label: 'Draft' },
  { n: 4, label: 'Audit' },
  { n: 5, label: 'Deliver' },
]

function stepToNavIndex(step: string, phaseStatuses: string[]): number {
  if (step === 'upload' || step === 'history') return 0
  if (step === 'vacancy') return 1
  if (step === 'generating') {
    const draftDone = phaseStatuses[2] === 'complete'
    return draftDone ? 3 : 2
  }
  return 4
}

export default function App() {
  const step = useAppStore(s => s.step)
  const phases = useAppStore(s => s.phases)
  const goHistory = useAppStore(s => s.goHistory)
  const reset = useAppStore(s => s.reset)

  const navIdx = stepToNavIndex(step, phases.map(p => p.status))
  const isHistory = step === 'history'

  return (
    <div className="col" style={{ minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--paper)', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ maxWidth: 1380, margin: '0 auto', padding: '16px 28px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
          <div className="row ai-center gap-3">
            <button onClick={reset} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <LogoMark size={44}/>
              <div className="col">
                <span className="display" style={{ fontSize: 26 }}>cl<span style={{ color: 'var(--terracotta)' }}>.</span></span>
                <span className="hand" style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1, marginTop: -2 }}>your cover-letter expedition</span>
              </div>
            </button>
          </div>

          {!isHistory && (
            <nav className="phase-nav" style={{ justifySelf: 'center' }}>
              {NAV_ITEMS.map((it, i) => (
                <button key={it.n}
                        className={navIdx === i ? 'active' : (navIdx > i ? 'done' : '')}
                        style={{ cursor: 'default' }}>
                  <span style={{ opacity: .5, marginRight: 6 }}>0{it.n}</span>{it.label}
                </button>
              ))}
            </nav>
          )}

          <div className="row ai-center gap-3" style={{ justifySelf: 'end' }}>
            <button
              className="btn btn-ghost"
              onClick={isHistory ? reset : goHistory}
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {isHistory ? '← new letter' : '⊞ history'}
            </button>
            <span className="pill pill-soft">
              <span style={{ width: 8, height: 8, background: 'var(--moss)', borderRadius: '50%' }}/>
              Agent online
            </span>
          </div>
        </div>
      </header>

      <main style={{ flex: '1 0 auto' }}>
        {step === 'upload' && <UploadStep />}
        {step === 'vacancy' && <VacancyStep />}
        {step === 'generating' && <ProgressView />}
        {step === 'result' && <ResultView />}
        {step === 'history' && <HistoryView />}
      </main>
    </div>
  )
}
