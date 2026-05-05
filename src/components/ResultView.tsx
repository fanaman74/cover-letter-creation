import { useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { exportDocx, refineLetter } from '../lib/api'
import { IconEnvelope, Star } from './Illos'

export default function ResultView() {
  const { result, error, reset, updateLetterText } = useAppStore()
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState<string | null>(null)

  async function handleRefine() {
    if (!result || !refinePrompt.trim()) return
    setRefineError(null)
    setRefining(true)
    try {
      const refined = await refineLetter(result.letterText, refinePrompt.trim())
      updateLetterText(refined)
      setRefinePrompt('')
    } catch (e) {
      setRefineError((e as Error).message)
    } finally {
      setRefining(false)
    }
  }

  async function handleDownload() {
    if (!result) return
    setDownloadError(null)
    setDownloading(true)
    try {
      const blob = await exportDocx(result.metadata)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeName = result.metadata.candidateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      a.href = url
      a.download = `cover_letter_${safeName}.docx`
      a.click()
      URL.revokeObjectURL(url)
      setDownloaded(true)
    } catch (e) {
      setDownloadError((e as Error).message)
    } finally {
      setDownloading(false)
    }
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1380, margin: '0 auto', padding: '28px 28px' }}>
        <div className="col gap-3" style={{ marginBottom: 24 }}>
          <span className="ribbon ribbon-accent">Phase 05 · Deliver</span>
          <h1 className="display" style={{ fontSize: 56, margin: 0, color: 'var(--rust)' }}>
            Something went wrong.
          </h1>
        </div>
        <div className="card" style={{ padding: 24, maxWidth: 640 }}>
          <p className="hand" style={{ fontSize: 22, color: 'var(--rust)', margin: '0 0 8px 0' }}>Generation failed</p>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 20px 0', lineHeight: 1.6 }}>{error}</p>
          <button className="btn btn-ghost" onClick={reset}>← start over</button>
        </div>
      </div>
    )
  }

  if (!result) return null

  const { metadata, letterText } = result
  const wordCount = letterText.trim().split(/\s+/).length

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '28px 28px' }}>
      <div className="row between ai-end" style={{ flexWrap: 'wrap', gap: 18, marginBottom: 22 }}>
        <div className="col gap-2">
          <span className="ribbon ribbon-accent">Phase 05 · Deliver</span>
          <h1 className="display" style={{ fontSize: 56, margin: 0 }}>
            Press <span className="display-italic" style={{ color: 'var(--terracotta)' }}>send</span>.
          </h1>
        </div>
        <div className="row gap-3 ai-center">
          <IconEnvelope size={64}/>
          <div className="col gap-1">
            <span className="hand" style={{ fontSize: 22, color: 'var(--rust)' }}>
              everything checks out
            </span>
            <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              {metadata.roleTitle} · {metadata.employerName}
            </span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
        {/* Left — doc preview */}
        <div className="col gap-4 ai-center">
          <div
            className="doc-page"
            style={{
              width: '100%',
              maxWidth: 720,
              aspectRatio: '210 / 297',
              padding: '60px 72px',
              position: 'relative',
              transform: 'rotate(-0.4deg)',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16 }}>{metadata.candidateName}</div>
            <div style={{ fontSize: 11, color: '#444' }}>{metadata.city}, {metadata.date}</div>
            <div style={{ marginTop: 22, fontSize: 11 }}>
              {metadata.employerName}<br/>
              {metadata.teamUnit && <>{metadata.teamUnit}<br/></>}
              {metadata.employerLocation}
            </div>
            <div style={{ marginTop: 18, fontSize: 11, fontWeight: 700 }}>
              Re: Application — {metadata.roleTitle}{metadata.reference ? ` — ${metadata.reference}` : ''}
            </div>
            <div style={{ marginTop: 16, fontSize: 11 }}>{metadata.salutation},</div>
            {metadata.bodyParagraphs.map((p, i) => (
              <p key={i} style={{ fontSize: 11, lineHeight: 1.35, margin: '10px 0 0 0' }}>{p}</p>
            ))}
            <p style={{ fontSize: 11, lineHeight: 1.35, margin: '14px 0 0 0' }}>Yours sincerely,</p>
            <p style={{ fontSize: 11, lineHeight: 1.35, margin: '22px 0 0 0', fontWeight: 700 }}>{metadata.candidateName}</p>
            {metadata.contactDetails && (
              <p style={{ fontSize: 10, color: '#555', margin: '2px 0 0 0' }}>{metadata.contactDetails}</p>
            )}
            <div style={{ position: 'absolute', bottom: 20, right: 28, fontSize: 9, color: '#999' }}>1 / 1</div>
            <div style={{ position: 'absolute', top: 24, right: -18 }}>
              <span className="stamp" style={{ fontSize: 16 }}>APPROVED · 10/10</span>
            </div>
          </div>

          <div className="row gap-3 ai-center" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={reset}>← new letter</button>
            <button className="btn btn-ghost" onClick={() => {
              navigator.clipboard.writeText(
                [metadata.candidateName, `${metadata.city}, ${metadata.date}`, '', metadata.employerName,
                 metadata.teamUnit, metadata.employerLocation, '', `Re: Application — ${metadata.roleTitle}`,
                 '', `${metadata.salutation},`, '', ...metadata.bodyParagraphs, '', 'Yours sincerely,', '',
                 metadata.candidateName, metadata.contactDetails].filter(Boolean).join('\n')
              )
            }}>↗ copy text</button>
            <button className="btn" onClick={handleDownload} disabled={downloading}>
              {downloading ? '⟳ generating…' : downloaded ? '✓ downloaded!' : '⬇ cover_letter.docx'}
            </button>
          </div>
          {downloadError && (
            <p className="hand" style={{ fontSize: 18, color: 'var(--rust)' }}>{downloadError}</p>
          )}
        </div>

        {/* Right — spec + quality gate */}
        <div className="col gap-4">
          <div className="card" style={{ padding: 22 }}>
            <div className="row gap-3 ai-center" style={{ marginBottom: 12 }}>
              <Star fill="#6e8e4e"/>
              <span className="display" style={{ fontSize: 24 }}>Document spec</span>
            </div>
            <div className="col gap-2">
              {[
                ['Font', 'Arial 11pt body · 13pt name'],
                ['Page', 'A4 — 11906 × 16838 DXA'],
                ['Margins', '2.5 cm all sides'],
                ['Line', '1.15 body · 12pt after'],
                ['Words', `${wordCount} (target 350–450)`],
                ['Output', 'cover_letter.docx'],
              ].map(([k, v], i) => (
                <div key={i} className="row between" style={{ paddingBottom: 6, borderBottom: i < 5 ? '2px dashed var(--hair)' : 0 }}>
                  <span className="small-caps" style={{ color: 'var(--ink-3)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22, background: '#dff0d4' }}>
            <div className="row gap-3 ai-center" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>✦</span>
              <span className="display" style={{ fontSize: 22 }}>Final quality gate</span>
            </div>
            <div className="col gap-1">
              {[
                'Non-generic opener',
                'Every criterion evidenced',
                '0 banned phrases',
                'Passive voice < 2',
                'Varied sentence length',
                'EU date format',
                '1 × A4 fit',
              ].map((s, i) => (
                <div key={i} className="row gap-2 ai-center" style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--moss)', fontWeight: 700 }}>✓</span>{s}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="row gap-3 ai-center" style={{ padding: '14px 18px', background: 'var(--ink)', color: 'var(--paper)' }}>
              <span style={{ width: 10, height: 10, background: '#34c759', borderRadius: '50%' }}/>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>pipeline complete</span>
            </div>
            <pre style={{
              margin: 0, padding: 14,
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11, lineHeight: 1.55,
              background: '#1a1612', color: '#e8d8b8',
              whiteSpace: 'pre-wrap',
            }}>{`> cv_analysis      ✓
> vacancy_review   ✓
> draft_letter     ✓
> audit_letter     ✓
> wrote cover_letter.docx
> ready to ship.`}</pre>
          </div>
        </div>
      </div>

      {/* Refine section */}
      <div className="card" style={{ marginTop: 28, padding: 24 }}>
        <div className="row gap-3 ai-center" style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 22 }}>✦</span>
          <span className="display" style={{ fontSize: 22 }}>Refine the letter</span>
          <span className="hand" style={{ fontSize: 16, color: 'var(--ink-3)', marginLeft: 4 }}>tell the agent what to change</span>
        </div>
        <div className="row gap-3" style={{ alignItems: 'flex-end' }}>
          <textarea
            className="ink-field"
            value={refinePrompt}
            onChange={e => setRefinePrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRefine() }}
            placeholder="e.g. make the opening stronger · add more about project management · shorten by 50 words · use a warmer tone"
            rows={3}
            style={{ flex: 1 }}
            disabled={refining}
          />
          <button
            className="btn"
            onClick={handleRefine}
            disabled={refining || !refinePrompt.trim()}
            style={{ minWidth: 120, alignSelf: 'stretch' }}
          >
            {refining ? '⟳ refining…' : '↺ refine'}
          </button>
        </div>
        {refineError && (
          <p className="hand" style={{ fontSize: 16, color: 'var(--rust)', marginTop: 10 }}>{refineError}</p>
        )}
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
          Tip: ⌘↵ to submit · the letter and doc preview update instantly
        </p>
      </div>
    </div>
  )
}
