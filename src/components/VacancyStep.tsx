import { useState, useRef } from 'react'
import { useAppStore } from '../stores/appStore'
import { streamPostSse } from '../lib/sse'
import { IconVacancy, Star } from './Illos'
import type { LetterMetadata } from '../types'

interface SseEvent {
  phase: string
  status?: string
  data?: { letterText: string; metadata: LetterMetadata }
  message?: string
}

interface VacancySummary {
  employer: string
  role: string
  location: string
  contractType: string
  reference: string
  deadline: string
  essentialCriteria: string[]
  advantageousCriteria: string[]
  keyResponsibilities: string[]
}

const TONE_OPTS = [
  { id: 'EU', label: 'EU / Agency', c: 'var(--teal)', desc: 'Formal-professional. Measured confidence. Mirror mission/mandate language.' },
  { id: 'UN', label: 'UN / Intl', c: 'var(--moss)', desc: 'Mission-driven. Global scope and cross-cultural experience foregrounded.' },
  { id: 'PRIV', label: 'Private', c: 'var(--terracotta)', desc: 'Warmer, more direct. Outcomes and impact lead. Quantify where possible.' },
  { id: 'NGO', label: 'NGO', c: 'var(--plum)', desc: 'Values-aligned. Concrete contribution framed in mission terms.' },
]

export default function VacancyStep() {
  const { cvText, vacancyText, setVacancyText, startGeneration, updatePhase, setResult, setError, reset } = useAppStore()
  const [mode, setMode] = useState<'paste' | 'url'>('paste')
  const [localText, setLocalText] = useState(vacancyText)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)
  const [tone, setTone] = useState('EU')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Use a ref for URL so paste always works regardless of React's synthetic events
  const urlRef = useRef<HTMLInputElement>(null)

  // Summarise state
  const [summarising, setSummarising] = useState(false)
  const [summary, setSummary] = useState<VacancySummary | null>(null)
  const [summariseError, setSummariseError] = useState<string | null>(null)

  async function runSummarise(text: string) {
    setSummariseError(null)
    setSummarising(true)
    setSummary(null)
    try {
      const res = await fetch('/api/summarise-vacancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacancyText: text }),
      })
      const data = await res.json() as VacancySummary & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Summarise failed')
      setSummary(data)
    } catch (e) {
      setSummariseError((e as Error).message)
    } finally {
      setSummarising(false)
    }
  }

  async function handleFetchUrl() {
    const urlVal = urlRef.current?.value.trim() ?? ''
    if (!urlVal) {
      setFetchError('Enter a URL first')
      return
    }
    setFetchError(null)
    setFetching(true)
    setFetched(false)
    setSummary(null)
    try {
      const res = await fetch('/api/fetch-vacancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlVal }),
      })
      const data = await res.json() as { text?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch page')
      const pageText = data.text ?? ''
      setLocalText(pageText)
      setFetched(true)
      if (pageText.trim().length >= 50) await runSummarise(pageText)
    } catch (e) {
      setFetchError((e as Error).message)
    } finally {
      setFetching(false)
    }
  }

  async function handleSummarise() {
    if (localText.trim().length < 50) {
      setValidationError('Paste or fetch a vacancy (at least 50 characters)')
      return
    }
    setValidationError(null)
    await runSummarise(localText.trim())
  }

  async function handleGenerate() {
    if (localText.trim().length < 50) {
      setValidationError('Paste or fetch a vacancy (at least 50 characters)')
      return
    }
    setValidationError(null)
    setVacancyText(localText.trim())
    startGeneration()

    try {
      const stream = streamPostSse('/api/generate', { cvText, vacancyText: localText.trim() })
      for await (const raw of stream) {
        const e = raw as SseEvent
        if (e.phase === 'cv_analysis') {
          updatePhase('cv_analysis', e.status === 'start' ? 'running' : 'complete')
        } else if (e.phase === 'vacancy_review') {
          updatePhase('vacancy_review', e.status === 'start' ? 'running' : 'complete')
        } else if (e.phase === 'draft_letter') {
          updatePhase('draft_letter', e.status === 'start' ? 'running' : 'complete')
        } else if (e.phase === 'audit_letter') {
          updatePhase('audit_letter', e.status === 'start' ? 'running' : 'complete')
        } else if (e.phase === 'complete' && e.data) {
          setResult({ letterText: e.data.letterText, metadata: e.data.metadata })
        } else if (e.phase === 'error') {
          setError(e.message ?? 'Unknown error')
        }
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '28px 28px' }}>
      <div className="col gap-4" style={{ marginBottom: 24 }}>
        <div className="row gap-3 ai-center">
          <span className="ribbon ribbon-teal">Phase 02 · Vacancy review</span>
          <span className="hand" style={{ fontSize: 22, color: 'var(--rust)' }}>where are we sending it?</span>
        </div>
        <h1 className="display" style={{ fontSize: 56, margin: 0 }}>
          The <span className="display-italic" style={{ color: 'var(--teal)' }}>destination</span> shapes the letter.
        </h1>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 28 }}>
        {/* Left — vacancy input */}
        <div className="col gap-5">
          <div className="card" style={{ padding: 24 }}>
            <div className="row between ai-center" style={{ marginBottom: 14 }}>
              <div className="row gap-4 ai-center">
                <IconVacancy size={56}/>
                <div className="col gap-1">
                  <span className="small-caps" style={{ color: 'var(--ink-3)' }}>The vacancy</span>
                  <span className="display" style={{ fontSize: 28 }}>Job posting</span>
                </div>
              </div>
              <div className="row gap-2">
                {(['paste', 'url'] as const).map(m => (
                  <button key={m} className="btn btn-ghost"
                    onClick={() => { setMode(m); setFetchError(null); setValidationError(null); setSummary(null) }}
                    style={{ padding: '8px 16px', background: mode === m ? 'var(--ink)' : '#fff', color: mode === m ? 'var(--paper)' : 'var(--ink)' }}>
                    {m === 'paste' ? 'Paste text' : '↗ From URL'}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'url' && (
              <div className="col gap-3" style={{ marginBottom: 14 }}>
                <div className="row gap-2" style={{ alignItems: 'stretch' }}>
                  <input
                    ref={urlRef}
                    className="ink-field"
                    type="text"
                    defaultValue=""
                    onKeyDown={e => e.key === 'Enter' && handleFetchUrl()}
                    onChange={() => { setFetched(false); setSummary(null) }}
                    placeholder="https://careers.example.com/job/123"
                    style={{ flex: 1 }}
                    disabled={fetching}
                  />
                  <button className="btn" onClick={handleFetchUrl} disabled={fetching} style={{ minWidth: 100 }}>
                    {fetching ? '⟳ fetching…' : '↗ fetch'}
                  </button>
                </div>
                {fetchError && (
                  <p className="hand" style={{ fontSize: 16, color: 'var(--rust)', margin: 0 }}>{fetchError}</p>
                )}
                {fetched && (
                  <p className="hand" style={{ fontSize: 16, color: 'var(--moss)', margin: 0 }}>
                    ✓ page loaded — {localText.split(/\s+/).length} words extracted
                  </p>
                )}
              </div>
            )}

            <textarea
              className="ink-field"
              value={localText}
              onChange={e => { setLocalText(e.target.value); setSummary(null) }}
              placeholder={mode === 'url'
                ? 'Extracted text will appear here — you can edit it before generating…'
                : 'Include the full job description, tasks, selection criteria, employer details, and reference number…'}
              rows={mode === 'url' ? 12 : 16}
            />
            {validationError && (
              <p className="hand" style={{ fontSize: 18, color: 'var(--rust)', marginTop: 8 }}>{validationError}</p>
            )}
          </div>

          <div className="card" style={{ padding: 22, background: 'var(--paper-2)' }}>
            <div className="row gap-3 ai-center" style={{ marginBottom: 10 }}>
              <Star fill="#f5d572"/>
              <span className="display" style={{ fontSize: 22 }}>What the agent extracts</span>
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              {['Employer & unit', 'Role title & ref', 'Essential criteria', 'Advantageous criteria', 'Mirror language', 'Gap analysis', 'Salutation'].map(t => (
                <span key={t} className="pill pill-soft" style={{ fontSize: 12 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — tone + pipeline */}
        <div className="col gap-5">
          <div className="card" style={{ padding: 22 }}>
            <div className="row between ai-center" style={{ marginBottom: 12 }}>
              <span className="display" style={{ fontSize: 24 }}>Tone calibration</span>
              <span className="hand" style={{ fontSize: 18, color: 'var(--rust)' }}>auto-detected</span>
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
              {TONE_OPTS.map(o => (
                <button key={o.id} className="btn btn-ghost"
                  onClick={() => setTone(o.id)}
                  style={{ background: tone === o.id ? o.c : '#fff', color: tone === o.id ? '#fff' : 'var(--ink)', padding: '10px 16px' }}>
                  {o.label}
                </button>
              ))}
            </div>
            <p className="hand" style={{ fontSize: 19, color: 'var(--ink-2)', margin: 0 }}>
              {TONE_OPTS.find(o => o.id === tone)?.desc}
            </p>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="small-caps" style={{ color: 'var(--ink-3)', marginBottom: 12 }}>Pipeline</div>
            <div className="col gap-3">
              {[
                { n: '01', label: 'CV analysis', note: 'reads career arc + hooks' },
                { n: '02', label: 'Vacancy review', note: 'criteria mapping + gaps' },
                { n: '03', label: 'Draft letter', note: '300–420 words, no clichés' },
                { n: '04', label: 'AI audit', note: '12 quality gates' },
              ].map(item => (
                <div key={item.n} className="row gap-3 ai-center">
                  <span className="stat-num" style={{ fontSize: 28, lineHeight: 1, color: 'var(--ink-3)', minWidth: 32 }}>{item.n}</span>
                  <div className="col">
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{item.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="row between ai-center">
            <button className="btn btn-ghost" onClick={reset}>← back to CV</button>
            <div className="row gap-2">
              <button
                className="btn btn-ghost"
                onClick={handleSummarise}
                disabled={summarising}
                style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}
              >
                {summarising ? '⟳ summarising…' : summary ? '↺ re-summarise' : '↗ summarise vacancy'}
              </button>
              <button className="btn" onClick={handleGenerate}>
                generate cover letter →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary card — full width, below both columns */}
      {(summarising || summariseError || summary) && (
        <div style={{ marginTop: 28 }}>
          <div className="card" style={{ padding: 28 }}>
            <div className="row between ai-center" style={{ marginBottom: 18 }}>
              <div className="row gap-3 ai-center">
                <span className="ribbon ribbon-teal">Vacancy summary</span>
                {summarising && <span className="hand" style={{ fontSize: 16, color: 'var(--ink-3)' }}>⟳ analysing…</span>}
              </div>
              {summary && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>review before generating</span>}
            </div>

            {summariseError && (
              <p className="hand" style={{ fontSize: 16, color: 'var(--rust)', margin: 0 }}>{summariseError}</p>
            )}

            {summary && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Left: overview */}
                <div className="col gap-3">
                  <div>
                    <div className="small-caps" style={{ color: 'var(--ink-3)', marginBottom: 4 }}>Role</div>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>{summary.role}</div>
                    <div style={{ fontSize: 16, color: 'var(--ink-2)' }}>{summary.employer}</div>
                  </div>
                  <div className="row gap-4" style={{ flexWrap: 'wrap', fontSize: 14, color: 'var(--ink-2)' }}>
                    {summary.location && <span>📍 {summary.location}</span>}
                    {summary.contractType && summary.contractType !== 'Unknown' && <span>📋 {summary.contractType}</span>}
                    {summary.reference && <span>🔖 {summary.reference}</span>}
                    {summary.deadline && <span>⏰ {summary.deadline}</span>}
                  </div>
                  {summary.keyResponsibilities.length > 0 && (
                    <div>
                      <div className="small-caps" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>Key responsibilities</div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>
                        {summary.keyResponsibilities.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right: criteria */}
                <div className="col gap-4">
                  {summary.essentialCriteria.length > 0 && (
                    <div>
                      <div className="small-caps" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>Essential criteria</div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>
                        {summary.essentialCriteria.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                  {summary.advantageousCriteria.length > 0 && (
                    <div>
                      <div className="small-caps" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>Advantageous</div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6 }}>
                        {summary.advantageousCriteria.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
