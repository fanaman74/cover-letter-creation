export type AppStep = 'upload' | 'vacancy' | 'generating' | 'result' | 'history'

export type PhaseStatus = 'pending' | 'running' | 'complete' | 'error'

export interface Phase {
  id: 'cv_analysis' | 'vacancy_review' | 'draft_letter' | 'audit_letter'
  label: string
  status: PhaseStatus
}

export interface LetterMetadata {
  candidateName: string
  city: string
  date: string
  employerName: string
  teamUnit: string
  employerLocation: string
  roleTitle: string
  reference: string
  salutation: string
  bodyParagraphs: string[]
  contactDetails: string
}

export interface GenerateResult {
  letterText: string
  metadata: LetterMetadata
}

export interface HistoryEntry {
  id: string
  company: string
  jobTitle: string
  location: string
  date: string
  reference: string
  letterText: string
}
