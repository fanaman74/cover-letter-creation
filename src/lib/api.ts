import type { LetterMetadata } from '../types'

export async function uploadCv(file: File): Promise<{ text: string; filename: string }> {
  const form = new FormData()
  form.append('cv', file)
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? 'Upload failed')
  }
  return res.json() as Promise<{ text: string; filename: string }>
}

export async function refineLetter(letterText: string, prompt: string): Promise<string> {
  const res = await fetch('/api/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ letterText, prompt }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? 'Refinement failed')
  }
  const data = await res.json() as { letterText: string }
  return data.letterText
}

export async function exportDocx(metadata: LetterMetadata): Promise<Blob> {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? 'Export failed')
  }
  return res.blob()
}
