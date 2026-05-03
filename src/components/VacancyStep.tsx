import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { streamPostSse } from '../lib/sse'
import type { LetterMetadata } from '../types'

interface SseEvent {
  phase: string
  status?: string
  data?: { letterText: string; metadata: LetterMetadata }
  message?: string
}

export default function VacancyStep() {
  const {
    cvText,
    vacancyText,
    setVacancyText,
    startGeneration,
    updatePhase,
    setResult,
    setError,
    reset,
  } = useAppStore()

  const [localText, setLocalText] = useState(vacancyText)
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleGenerate() {
    if (localText.trim().length < 50) {
      setValidationError('Paste the full vacancy announcement (at least 50 characters)')
      return
    }
    setValidationError(null)
    setVacancyText(localText.trim())
    startGeneration()
    setSubmitting(true)

    try {
      const stream = streamPostSse('/api/generate', {
        cvText,
        vacancyText: localText.trim(),
      })

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
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={reset}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h2 className="text-xl font-semibold mb-1">Paste the vacancy</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        Include the full job description, selection criteria, and employer details.
      </p>

      <textarea
        value={localText}
        onChange={e => setLocalText(e.target.value)}
        placeholder="Paste the full vacancy announcement here…"
        rows={16}
        className="w-full rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2"
        style={{ border: '1px solid var(--border)' }}
      />

      {validationError && (
        <p className="mt-2 text-sm" style={{ color: 'var(--error)' }}>
          {validationError}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={submitting}
        className="mt-4 w-full py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        Generate cover letter
      </button>
    </div>
  )
}
