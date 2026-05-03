import { useState } from 'react'
import { Download, RotateCcw, AlertCircle } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { exportDocx } from '../lib/api'

export default function ResultView() {
  const { result, error, reset } = useAppStore()
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

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
    } catch (e) {
      setDownloadError((e as Error).message)
    } finally {
      setDownloading(false)
    }
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto">
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-6"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
          }}
        >
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--error)' }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--error)' }}>
              Generation failed
            </p>
            <p className="text-sm mt-1" style={{ color: '#b91c1c' }}>
              {error}
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          <RotateCcw className="w-4 h-4" />
          Start over
        </button>
      </div>
    )
  }

  if (!result) return null

  const { metadata, letterText } = result

  const previewLines = [
    metadata.candidateName,
    `${metadata.city}, ${metadata.date}`,
    '',
    metadata.employerName,
    metadata.teamUnit,
    metadata.employerLocation,
    '',
    `Re: Application — ${metadata.roleTitle}${metadata.reference ? ` — ${metadata.reference}` : ''}`,
    '',
    `${metadata.salutation},`,
    '',
    ...metadata.bodyParagraphs.flatMap(p => [p, '']),
    'Yours sincerely,',
    '',
    metadata.candidateName,
    metadata.contactDetails,
  ]
    .filter(line => line !== undefined && line !== null)
    .join('\n')

  const wordCount = letterText.trim().split(/\s+/).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Cover letter ready</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {metadata.roleTitle} · {metadata.employerName}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors"
            style={{ border: '1px solid var(--border)', background: '#fff' }}
          >
            <RotateCcw className="w-4 h-4" />
            New letter
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Generating…' : 'Download .docx'}
          </button>
        </div>
      </div>

      {downloadError && (
        <p className="mb-4 text-sm" style={{ color: 'var(--error)' }}>
          {downloadError}
        </p>
      )}

      <div
        className="rounded-xl p-8 whitespace-pre-line shadow-sm"
        style={{
          background: '#fff',
          border: '1px solid var(--border)',
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          lineHeight: '1.7',
        }}
      >
        {previewLines}
      </div>

      <p className="text-xs mt-3 text-center" style={{ color: 'var(--muted)' }}>
        {wordCount} words (body)
      </p>
    </div>
  )
}
