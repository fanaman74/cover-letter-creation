import { useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { useAppStore } from '../stores/appStore'
import { uploadCv } from '../lib/api'
import { Scene, IconCV, Star, ArrowDoodle } from './Illos'

export default function UploadStep() {
  const { setCvText, cvFilename } = useAppStore()
  const [mode, setMode] = useState<'file' | 'paste'>('file')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [picked, setPicked] = useState(false)
  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      const { text, filename } = await uploadCv(file)
      setPicked(true)
      setCvText(text, filename)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handlePasteSubmit() {
    if (pasteText.trim().length < 100) {
      setError('CV text must be at least 100 characters')
      return
    }
    setError(null)
    setCvText(pasteText.trim(), 'pasted-cv.txt')
  }

  return (
    <>
      {/* Hero */}
      <section className="scene">
        <Scene height={380}/>
        <div style={{ position: 'absolute', inset: 0, padding: '32px 28px', maxWidth: 1380, margin: '0 auto' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="col gap-3" style={{ maxWidth: 620 }}>
              <span className="ribbon ribbon-accent">Phase 01 · CV Analysis</span>
              <h1 className="display" style={{ fontSize: 64, margin: 0, color: 'var(--ink)' }}>
                Let's read your{' '}
                <span className="display-italic scribble-under" style={{ color: 'var(--rust)' }}>life on paper</span>.
              </h1>
              <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 540, margin: 0, lineHeight: 1.5 }}>
                Drop your CV below. Our agent will pull out roles, skills, languages, and the moments that make a panel sit up.
              </p>
            </div>
            <div className="col gap-2 ai-end" style={{ marginTop: 18 }}>
              <span className="hand" style={{ fontSize: 22, color: 'var(--rust)', transform: 'rotate(-4deg)' }}>step one →</span>
              <ArrowDoodle rotate={20}/>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1380, margin: '0 auto', padding: '32px 28px' }}>
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'stretch' }}>
          {/* Left — upload card */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="row between ai-center" style={{ marginBottom: 14 }}>
                <div className="row gap-3 ai-center">
                  <IconCV size={56}/>
                  <div className="col">
                    <span className="small-caps" style={{ color: 'var(--ink-3)' }}>The candidate</span>
                    <span className="display" style={{ fontSize: 26 }}>Your CV</span>
                  </div>
                </div>
                <div className="row gap-2">
                  {(['file', 'paste'] as const).map(m => (
                    <button key={m} className={`btn btn-ghost`}
                            onClick={() => setMode(m)}
                            style={{ padding: '8px 16px', background: mode === m ? 'var(--ink)' : '#fff', color: mode === m ? 'var(--paper)' : 'var(--ink)' }}>
                      {m === 'file' ? 'Upload file' : 'Paste text'}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'file' ? (
                <>
                  <input
                    id="cv-file-input"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: 'none' }}
                    onChange={onFileChange}
                  />
                  <label
                    htmlFor="cv-file-input"
                    className={`drop col gap-2 center${dragging ? ' over' : ''}`}
                    style={{ display: 'flex', flex: 1 }}
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                  >
                    {loading ? (
                      <>
                        <span className="display" style={{ fontSize: 28 }}>reading…</span>
                        <span className="hand" style={{ fontSize: 18, color: 'var(--rust)' }}>extracting text</span>
                      </>
                    ) : picked ? (
                      <>
                        <Star size={28}/>
                        <span className="display-italic" style={{ fontSize: 30 }}>{cvFilename}</span>
                        <span className="hand" style={{ fontSize: 18, color: 'var(--rust)' }}>loaded — navigating to vacancy →</span>
                      </>
                    ) : (
                      <>
                        <span className="display" style={{ fontSize: 32 }}>drop your CV here</span>
                        <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>.pdf · .docx — or click to browse · max 10 MB</span>
                      </>
                    )}
                  </label>
                </>
              ) : (
                <div className="col gap-3">
                  <textarea
                    className="ink-field"
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    placeholder="Paste your CV text here…"
                    rows={10}
                  />
                  <button className="btn" onClick={handlePasteSubmit} style={{ width: '100%', justifyContent: 'center' }}>
                    Continue to vacancy →
                  </button>
                </div>
              )}

              {error && (
                <p className="hand" style={{ fontSize: 18, color: 'var(--rust)', marginTop: 12 }}>{error}</p>
              )}
            </div>
          </div>

          {/* Right — instructions */}
          <div className="col gap-5">
            <div className="card" style={{ padding: 22, background: 'var(--paper-2)' }}>
              <div className="row gap-3 ai-center" style={{ marginBottom: 14 }}>
                <Star fill="#d96b3a"/>
                <span className="display" style={{ fontSize: 24 }}>What happens next</span>
              </div>
              <div className="col gap-4">
                {[
                  { n: '01', title: 'CV Analysis', body: 'Agent reads your roles, skills, certifications, and languages — and picks out the three most distinctive moments in your career.' },
                  { n: '02', title: 'Vacancy Review', body: 'Selection criteria are mapped to your evidence. Gaps are flagged honestly with the strongest transferable proof.' },
                  { n: '03', title: 'Drafting', body: 'A 350–450-word letter is written without bullet points, without clichés, and without opening "I am writing to apply…".' },
                  { n: '04', title: 'AI Audit', body: 'Ten quality gates: banned phrases, passive voice, -ing tails, word count, A4 fit. All must pass before delivery.' },
                ].map(item => (
                  <div key={item.n} className="row gap-3" style={{ alignItems: 'flex-start' }}>
                    <span className="stat-num" style={{ fontSize: 36, lineHeight: 1, color: 'var(--ink-3)', minWidth: 40 }}>{item.n}</span>
                    <div className="col gap-1">
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</span>
                      <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{item.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div className="row gap-3 ai-center" style={{ marginBottom: 8 }}>
                <span className="small-caps" style={{ color: 'var(--ink-3)' }}>Output format</span>
              </div>
              <div className="col gap-2">
                {[
                  ['Font', 'Arial 11pt body · 13pt name'],
                  ['Page', 'A4 — 11906 × 16838 DXA'],
                  ['Margins', '2.5 cm all sides'],
                  ['Output', '.docx — download instantly'],
                ].map(([k, v], i) => (
                  <div key={i} className="row between" style={{ paddingBottom: 6, borderBottom: i < 3 ? '2px dashed var(--hair)' : 0 }}>
                    <span className="small-caps" style={{ color: 'var(--ink-3)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
