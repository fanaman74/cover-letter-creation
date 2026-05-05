import { useState, useEffect } from 'react'
import { useAppStore } from '../stores/appStore'
import { Star } from './Illos'
import type { HistoryEntry } from '../types'

const HISTORY_KEY = 'clg-history'

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function deleteEntry(id: string) {
  const prev = loadHistory()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(prev.filter(e => e.id !== id)))
}

export default function HistoryView() {
  const reset = useAppStore(s => s.reset)
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setEntries(loadHistory())
  }, [])

  function handleDelete(id: string) {
    deleteEntry(id)
    setEntries(prev => prev.filter(e => e.id !== id))
    if (expanded === id) setExpanded(null)
  }

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '32px 28px' }}>
      <div className="row between ai-end" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div className="col gap-2">
          <span className="ribbon ribbon-teal">Applications</span>
          <h1 className="display" style={{ fontSize: 56, margin: 0 }}>
            Your <span className="display-italic" style={{ color: 'var(--teal)' }}>expedition</span> log.
          </h1>
        </div>
        <div className="row gap-3 ai-center">
          {entries.length > 0 && (
            <div className="card" style={{ padding: '16px 24px', textAlign: 'center' }}>
              <div className="stat-num stat-num-teal" style={{ fontSize: 64 }}>{entries.length}</div>
              <div className="hand" style={{ fontSize: 18, color: 'var(--ink-2)' }}>letters sent</div>
            </div>
          )}
          <button className="btn" onClick={reset}>+ new letter</button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Star size={48} fill="#c8b890"/>
          <p className="display" style={{ fontSize: 32, marginTop: 16, marginBottom: 8 }}>No applications yet.</p>
          <p className="hand" style={{ fontSize: 22, color: 'var(--ink-3)', margin: 0 }}>Generate your first cover letter to start the log.</p>
          <button className="btn" style={{ marginTop: 24 }} onClick={reset}>start the expedition →</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 160px 44px',
            gap: 0,
            padding: '14px 24px',
            background: 'var(--ink)',
            color: 'var(--paper)',
          }}>
            <span className="small-caps" style={{ color: 'var(--hair)', letterSpacing: '.14em' }}>Company</span>
            <span className="small-caps" style={{ color: 'var(--hair)', letterSpacing: '.14em' }}>Job Title</span>
            <span className="small-caps" style={{ color: 'var(--hair)', letterSpacing: '.14em' }}>Location</span>
            <span className="small-caps" style={{ color: 'var(--hair)', letterSpacing: '.14em' }}>Date</span>
            <span/>
          </div>

          {entries.map((entry, i) => (
            <div key={entry.id}>
              {/* Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 160px 44px',
                  gap: 0,
                  padding: '16px 24px',
                  borderTop: i > 0 ? '2px dashed var(--hair)' : '2px solid var(--ink)',
                  background: expanded === entry.id ? '#fff3d9' : '#fdf6e6',
                  cursor: 'pointer',
                  transition: 'background .15s',
                  alignItems: 'center',
                }}
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              >
                <div className="col gap-1">
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{entry.company}</span>
                  {entry.reference && (
                    <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{entry.reference}</span>
                  )}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{entry.jobTitle}</span>
                <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{entry.location}</span>
                <span className="hand" style={{ fontSize: 17, color: 'var(--ink-3)' }}>{entry.date}</span>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(entry.id) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--ink-3)', fontSize: 18, padding: 4,
                    borderRadius: 6, lineHeight: 1,
                  }}
                  title="Remove"
                >×</button>
              </div>

              {/* Expanded letter preview */}
              {expanded === entry.id && (
                <div style={{
                  padding: '20px 24px 24px',
                  borderTop: '2px dashed var(--hair)',
                  background: '#fffbf2',
                }}>
                  <div className="row between ai-center" style={{ marginBottom: 14 }}>
                    <span className="small-caps" style={{ color: 'var(--ink-3)' }}>Letter preview</span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={() => {
                        navigator.clipboard.writeText(entry.letterText)
                      }}
                    >
                      ↗ copy text
                    </button>
                  </div>
                  <div style={{
                    background: '#fff',
                    border: '2px solid var(--ink)',
                    borderRadius: 12,
                    padding: '24px 28px',
                    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: '#111',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 360,
                    overflow: 'auto',
                  }}>
                    {entry.letterText}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
