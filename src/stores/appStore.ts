import { create } from 'zustand'
import type { AppStep, Phase, GenerateResult } from '../types'

const INITIAL_PHASES: Phase[] = [
  { id: 'cv_analysis', label: 'Analysing CV', status: 'pending' },
  { id: 'vacancy_review', label: 'Reviewing vacancy', status: 'pending' },
  { id: 'draft_letter', label: 'Drafting letter', status: 'pending' },
  { id: 'audit_letter', label: 'Running AI audit', status: 'pending' },
]

interface AppState {
  step: AppStep
  cvText: string
  cvFilename: string
  vacancyText: string
  phases: Phase[]
  result: GenerateResult | null
  error: string | null

  setCvText: (text: string, filename: string) => void
  setVacancyText: (text: string) => void
  startGeneration: () => void
  updatePhase: (id: Phase['id'], status: Phase['status']) => void
  setResult: (result: GenerateResult) => void
  setError: (error: string) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  step: 'upload',
  cvText: '',
  cvFilename: '',
  vacancyText: '',
  phases: INITIAL_PHASES,
  result: null,
  error: null,

  setCvText: (text, filename) => set({ cvText: text, cvFilename: filename, step: 'vacancy' }),
  setVacancyText: (text) => set({ vacancyText: text }),

  startGeneration: () =>
    set({
      step: 'generating',
      phases: INITIAL_PHASES.map(p => ({ ...p, status: 'pending' })),
      result: null,
      error: null,
    }),

  updatePhase: (id, status) =>
    set(state => ({
      phases: state.phases.map(p => (p.id === id ? { ...p, status } : p)),
    })),

  setResult: (result) => set({ result, step: 'result' }),
  setError: (error) => set({ error, step: 'result' }),

  reset: () =>
    set({
      step: 'upload',
      cvText: '',
      cvFilename: '',
      vacancyText: '',
      phases: INITIAL_PHASES.map(p => ({ ...p, status: 'pending' })),
      result: null,
      error: null,
    }),
}))
