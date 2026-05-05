import { runPrompt } from '../lib/claude.js'
import { cvAnalysisPrompt } from './prompts/cv-analysis.js'
import { vacancyReviewPrompt } from './prompts/vacancy-review.js'
import { draftLetterPrompt } from './prompts/draft-letter.js'
import { auditLetterPrompt } from './prompts/audit-letter.js'
import type { CvProfile, VacancyAnalysis, PipelineResult, LetterData } from './types.js'

function extractJson(raw: string): string {
  // Find first { or [ to last } or ]
  const objStart = raw.indexOf('{')
  const arrStart = raw.indexOf('[')
  const start = objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart)
  if (start === -1) return raw

  const isObj = raw[start] === '{'
  const close = isObj ? '}' : ']'
  const end = raw.lastIndexOf(close)
  if (end === -1 || end <= start) return raw

  return raw.slice(start, end + 1)
}

function parseJson<T>(raw: string): T {
  const cleaned = extractJson(raw)
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Try fixing unescaped newlines/tabs inside strings
    const fixed = cleaned.replace(/(?<=:\s*"(?:[^"\\]|\\.)*)[\n\r\t](?=(?:[^"\\]|\\.)*")/g, ' ')
    return JSON.parse(fixed) as T
  }
}

export type PhaseEvent =
  | { phase: 'cv_analysis'; status: 'start' | 'complete'; data?: CvProfile }
  | { phase: 'vacancy_review'; status: 'start' | 'complete'; data?: VacancyAnalysis }
  | { phase: 'draft_letter'; status: 'start' | 'complete' }
  | { phase: 'audit_letter'; status: 'start' | 'complete' }
  | { phase: 'complete'; data: PipelineResult }
  | { phase: 'error'; message: string }

export async function runPipeline(
  cvText: string,
  vacancyText: string,
  emit: (event: PhaseEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    // Phase 1: CV Analysis
    emit({ phase: 'cv_analysis', status: 'start' })
    const cvRaw = await runPrompt(cvAnalysisPrompt(cvText), signal)
    const cvProfile: CvProfile = parseJson<CvProfile>(cvRaw)
    emit({ phase: 'cv_analysis', status: 'complete' })

    // Phase 2: Vacancy Review
    emit({ phase: 'vacancy_review', status: 'start' })
    const vacancyRaw = await runPrompt(vacancyReviewPrompt(cvProfile, vacancyText), signal)
    const vacancy: VacancyAnalysis = parseJson<VacancyAnalysis>(vacancyRaw)
    emit({ phase: 'vacancy_review', status: 'complete' })

    // Phase 3: Draft Letter
    emit({ phase: 'draft_letter', status: 'start' })
    const draft = await runPrompt(draftLetterPrompt(cvProfile, vacancy), signal)
    emit({ phase: 'draft_letter', status: 'complete' })

    // Phase 4: Audit + Revise
    emit({ phase: 'audit_letter', status: 'start' })
    const finalLetter = await runPrompt(auditLetterPrompt(draft), signal)
    emit({ phase: 'audit_letter', status: 'complete' })

    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const metadata: LetterData = {
      candidateName: cvProfile.name,
      city: cvProfile.location.split(',')[0].trim(),
      date: today,
      employerName: vacancy.employerName,
      teamUnit: vacancy.teamUnit,
      employerLocation: vacancy.employerLocation,
      roleTitle: vacancy.roleTitle,
      reference: vacancy.reference,
      salutation: vacancy.salutation,
      bodyParagraphs: finalLetter
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(Boolean),
      contactDetails: cvProfile.contactDetails,
    }

    emit({ phase: 'complete', data: { letterText: finalLetter, metadata } })
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    emit({ phase: 'error', message: (err as Error).message })
  }
}
