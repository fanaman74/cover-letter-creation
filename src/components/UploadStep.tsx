import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload, FileText, Clipboard } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { uploadCv } from '../lib/api'

export default function UploadStep() {
  const { setCvText } = useAppStore()
  const [mode, setMode] = useState<'file' | 'paste'>('file')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      const { text, filename } = await uploadCv(file)
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
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-1">Upload your CV</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        PDF or DOCX, or paste plain text
      </p>

      <div className="flex gap-2 mb-6">
        {(['file', 'paste'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-4 py-1.5 rounded text-sm font-medium border transition-colors"
            style={
              mode === m
                ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                : { background: '#fff', color: 'var(--muted)', borderColor: 'var(--border)' }
            }
          >
            {m === 'file' ? (
              <>
                <Upload className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                Upload file
              </>
            ) : (
              <>
                <Clipboard className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                Paste text
              </>
            )}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors"
          style={{
            borderColor: dragging ? 'var(--accent)' : 'var(--border)',
            background: dragging ? '#eff6ff' : '#fff',
          }}
        >
          <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted)' }} />
          <p className="font-medium mb-1">
            {loading ? 'Processing…' : 'Drop your CV here'}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            or click to browse · PDF or DOCX · max 10 MB
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      ) : (
        <div>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste your CV text here…"
            rows={14}
            className="w-full rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2"
            style={{
              border: '1px solid var(--border)',
              // @ts-expect-error css variable
              '--tw-ring-color': 'var(--accent)',
            }}
          />
          <button
            onClick={handlePasteSubmit}
            className="mt-3 w-full py-2.5 rounded-lg font-medium transition-colors"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Continue
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
