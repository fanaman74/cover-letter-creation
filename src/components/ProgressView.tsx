import { useEffect, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { IconCV, IconVacancy, IconPen, IconBadge, Star } from './Illos'
import type { PhaseStatus } from '../types'

const PHASE_CONFIG = [
  {
    id: 'cv_analysis' as const,
    n: '01',
    label: 'CV Analysis',
    icon: <IconCV size={48}/>,
    steps: [
      'Reading CV.',
      'Extracting employer / role / dates blocks.',
      'Resolving acronyms and certifications.',
      'Building career arc (roles + highlights).',
      'Identifying narrative hooks.',
      'Profile assembled.',
    ],
  },
  {
    id: 'vacancy_review' as const,
    n: '02',
    label: 'Vacancy Review',
    icon: <IconVacancy size={48}/>,
    steps: [
      'Reading vacancy notice.',
      'Detecting employer type. Tone preset.',
      'Extracting essential + advantageous criteria.',
      'Identifying mirror language candidates.',
      'Mapping criteria → CV evidence.',
      'Gap analysis complete.',
    ],
  },
  {
    id: 'draft_letter' as const,
    n: '03',
    label: 'Drafting',
    icon: <IconPen size={48}/>,
    steps: [
      'Opening — concrete fact, not "I am writing to apply".',
      'Body paragraph 1: narrative hook + criteria evidence.',
      'Body paragraph 2: skills + language alignment.',
      'Honest gap acknowledged with transferable evidence.',
      'Close: specific reference + availability.',
      'Draft complete. Handing to audit.',
    ],
  },
  {
    id: 'audit_letter' as const,
    n: '04',
    label: 'AI Audit',
    icon: <IconBadge size={48}/>,
    steps: [
      'Scanning for banned phrases.',
      'Checking passive voice instances.',
      'Removing superficial -ing tails.',
      'Verifying sentence-length variance.',
      'Counting words (target 350–450).',
      'A4 · Arial 11pt layout check. All clear.',
    ],
  },
]

const AUDIT_GATES = [
  'Banned phrases removed',
  'Passive voice ≤ 2',
  'No bullet points',
  'No rule-of-three padding',
  'No em-dash rhythm',
  'No superficial -ing tails',
  'Sentence-length variance',
  'Word count 350–450',
  'EU date format',
  'Fits A4 · Arial 11pt · 2.5 cm',
]

function PhaseCard({
  config,
  status,
}: {
  config: typeof PHASE_CONFIG[number]
  status: PhaseStatus
}) {
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    if (status !== 'running') return
    if (stepIdx >= config.steps.length) return
    const t = setTimeout(() => setStepIdx(s => s + 1), 600)
    return () => clearTimeout(t)
  }, [status, stepIdx, config.steps.length])

  useEffect(() => {
    if (status === 'complete') setStepIdx(config.steps.length)
  }, [status, config.steps.length])

  const isPending = status === 'pending'
  const isRunning = status === 'running'
  const isDone = status === 'complete'

  return (
    <div
      className="card"
      style={{
        padding: 22,
        opacity: isPending ? 0.45 : 1,
        transition: 'opacity .4s',
        background: isDone ? '#f0f9eb' : '#fdf6e6',
      }}
    >
      <div className="row between ai-center" style={{ marginBottom: 12 }}>
        <div className="row gap-3 ai-center">
          {config.icon}
          <div className="col">
            <span className="small-caps" style={{ color: 'var(--ink-3)' }}>Phase {config.n}</span>
            <span className="display" style={{ fontSize: 22 }}>{config.label}</span>
          </div>
        </div>
        <span className="pill" style={{ gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isDone ? 'var(--moss)' : isRunning ? 'var(--terracotta)' : 'var(--hair)',
          }}/>
          {isDone ? 'done' : isRunning ? 'running…' : 'pending'}
        </span>
      </div>
      <div className="col gap-1" style={{ minHeight: 100 }}>
        {config.steps.slice(0, stepIdx).map((s, i) => (
          <div key={i} className="agent-step">
            <span style={{ color: isDone ? 'var(--moss)' : 'var(--rust)', marginRight: 6 }}>↳</span>
            {s}
          </div>
        ))}
        {isPending && (
          <div className="agent-step" style={{ color: 'var(--ink-3)', opacity: .6 }}>
            // awaiting previous phase
          </div>
        )}
        {isRunning && stepIdx < config.steps.length && (
          <div className="agent-step" style={{ color: 'var(--terracotta)' }}>
            <span style={{ marginRight: 6 }}>↳</span>
            <span>{config.steps[stepIdx]}<span className="caret"/></span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProgressView() {
  const phases = useAppStore(s => s.phases)
  const [gateIdx, setGateIdx] = useState(0)

  const auditPhase = phases.find(p => p.id === 'audit_letter')!
  const auditRunning = auditPhase.status === 'running'
  const auditDone = auditPhase.status === 'complete'

  useEffect(() => {
    if (!auditRunning && !auditDone) return
    if (gateIdx >= AUDIT_GATES.length) return
    const t = setTimeout(() => setGateIdx(g => g + 1), 280)
    return () => clearTimeout(t)
  }, [auditRunning, auditDone, gateIdx])

  useEffect(() => {
    if (auditDone) setGateIdx(AUDIT_GATES.length)
  }, [auditDone])

  const allDone = phases.every(p => p.status === 'complete')
  const doneCount = phases.filter(p => p.status === 'complete').length

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '28px 28px' }}>
      <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 18, marginBottom: 28 }}>
        <div className="col gap-2">
          <span className="ribbon ribbon-moss">Generating</span>
          <h1 className="display" style={{ fontSize: 56, margin: 0 }}>
            {allDone
              ? <>Letter <span className="display-italic" style={{ color: 'var(--moss)' }}>complete</span>.</>
              : <>Working through the <span className="display-italic" style={{ color: 'var(--moss)' }}>pipeline</span>.</>
            }
          </h1>
        </div>
        <div className="card" style={{ padding: '20px 28px', textAlign: 'center' }}>
          <div className="stat-num" style={{ fontSize: 88, color: allDone ? 'var(--moss)' : 'var(--ink)' }}>
            {doneCount} <span style={{ color: 'var(--ink-3)', fontSize: 60 }}>/ 4</span>
          </div>
          <div className="hand" style={{ fontSize: 20, color: allDone ? 'var(--moss)' : 'var(--ink-3)' }}>
            {allDone ? 'all phases done ✦' : 'phases complete'}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28 }}>
        {/* Left — phase cards */}
        <div className="col gap-4">
          {PHASE_CONFIG.map(cfg => {
            const ph = phases.find(p => p.id === cfg.id)!
            return <PhaseCard key={cfg.id} config={cfg} status={ph.status}/>
          })}
        </div>

        {/* Right — audit quality gates */}
        <div className="col gap-5">
          <div className="card" style={{ padding: 22 }}>
            <div className="row gap-3 ai-center" style={{ marginBottom: 14 }}>
              <Star fill="#d96b3a"/>
              <span className="display" style={{ fontSize: 24 }}>Quality gates</span>
              <span className="hand" style={{ fontSize: 18, color: 'var(--ink-3)' }}>{gateIdx} / {AUDIT_GATES.length}</span>
            </div>
            <div className="col gap-2">
              {AUDIT_GATES.map((gate, i) => {
                const passed = i < gateIdx
                return (
                  <div key={i} className={`gate-row${passed ? ' passed' : ''}`}>
                    <div className="row gap-3 ai-center">
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: passed ? 'var(--moss)' : 'transparent',
                        border: '2px solid var(--ink)',
                        display: 'grid', placeItems: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
                      }}>{passed ? '✓' : ''}</span>
                      <span style={{ fontSize: 13, fontWeight: passed ? 600 : 500 }}>{gate}</span>
                    </div>
                    <span className="hand" style={{ fontSize: 16, color: passed ? 'var(--moss)' : 'var(--ink-3)' }}>
                      {passed ? 'pass' : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="small-caps" style={{ color: 'var(--ink-3)', marginBottom: 12 }}>Status</div>
            <div className="col gap-2">
              {phases.map(p => (
                <div key={p.id} className="row between ai-center">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</span>
                  <span className="hand" style={{
                    fontSize: 16,
                    color: p.status === 'complete' ? 'var(--moss)' : p.status === 'running' ? 'var(--terracotta)' : 'var(--ink-3)',
                  }}>
                    {p.status === 'complete' ? '✓ done' : p.status === 'running' ? '⟳ running' : '○ pending'}
                  </span>
                </div>
              ))}
            </div>
            {!allDone && (
              <p className="hand" style={{ fontSize: 18, color: 'var(--ink-3)', marginTop: 14, marginBottom: 0 }}>
                This takes about 30–60 seconds…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
