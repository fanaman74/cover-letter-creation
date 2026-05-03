export interface CvProfile {
  name: string
  location: string
  currentRole: string
  currentEmployer: string
  contractType: string
  careerArc: Array<{
    employer: string
    title: string
    dates: string
    highlights: string[]
  }>
  coreCompetencies: string[]
  education: Array<{ institution: string; degree: string; year: string }>
  certifications: Array<{ name: string; body: string; year: string }>
  languages: Array<{ language: string; level: string }>
  contactDetails: string
  narrativeHooks: string[]
}

export interface VacancyAnalysis {
  employerName: string
  teamUnit: string
  mandate: string
  roleTitle: string
  reference: string
  contractType: string
  grade: string
  employerLocation: string
  register: 'eu' | 'un' | 'private' | 'ngo'
  selectionCriteria: {
    essential: string[]
    advantageous: string[]
    implicit: string[]
  }
  keyLanguage: string[]
  gaps: Array<{ criterion: string; transferableEvidence: string }>
  salutation: string
}

export interface LetterData {
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

export interface PipelineResult {
  letterText: string
  metadata: LetterData
}
