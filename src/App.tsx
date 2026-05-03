import { useAppStore } from './stores/appStore'
import UploadStep from './components/UploadStep'
import VacancyStep from './components/VacancyStep'
import ProgressView from './components/ProgressView'
import ResultView from './components/ResultView'

export default function App() {
  const step = useAppStore(s => s.step)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header
        className="border-b"
        style={{ background: '#fff', borderColor: 'var(--border)' }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <span className="text-white text-xs font-bold">CL</span>
          </div>
          <span className="font-semibold" style={{ color: 'var(--text)' }}>
            Cover Letter Generator
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {step === 'upload' && <UploadStep />}
        {step === 'vacancy' && <VacancyStep />}
        {step === 'generating' && <ProgressView />}
        {step === 'result' && <ResultView />}
      </main>
    </div>
  )
}
