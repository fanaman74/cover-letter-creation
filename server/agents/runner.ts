import { runPrompt } from '../lib/claude.js'
import { cvAnalysisPrompt } from './prompts/cv-analysis.js'
import { vacancyReviewPrompt } from './prompts/vacancy-review.js'
import { draftLetterPrompt } from './prompts/draft-letter.js'
import { auditLetterPrompt } from './prompts/audit-letter.js'
import type { CvProfile, VacancyAnalysis, PipelineResult, LetterData } from './types.js'

function stripFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
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
    const cvProfile: CvProfile = JSON.parse(stripFences(cvRaw))
    emit({ phase: 'cv_analysis', status: 'complete', data: cvProfile })

    // Phase 2: Vacancy Review
    emit({ phase: 'vacancy_review', status: 'start' })
    const vacancyRaw = await runPrompt(vacancyReviewPrompt(cvProfile, vacancyText), signal)
    const vacancy: VacancyAnalysis = JSON.parse(stripFences(vacancyRaw))
    emit({ phase: 'vacancy_review', status: 'complete', data: vacancy })

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
