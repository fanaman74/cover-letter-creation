import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import healthRouter from './routes/health.js'
import uploadRouter from './routes/upload.js'
import generateRouter from './routes/generate.js'
import exportRouter from './routes/export.js'
import refineRouter from './routes/refine.js'
import fetchVacancyRouter from './routes/fetch-vacancy.js'
import summariseVacancyRouter from './routes/summarise-vacancy.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '5mb' }))

  // Request logging
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - body size: ${JSON.stringify(req.body ?? {}).length}`)
    }
    next()
  })

  // Error logging
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[ERROR]', err.message, err.stack)
    res.status(500).json({ error: err.message })
  })

  app.use('/api/health', healthRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/api/generate', generateRouter)
  app.use('/api/export', exportRouter)
  app.use('/api/refine', refineRouter)
  app.use('/api/fetch-vacancy', fetchVacancyRouter)
  app.use('/api/summarise-vacancy', summariseVacancyRouter)

  // Serve built frontend in production
  const distPath = join(__dirname, '../dist')
  if (existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('/{*path}', (_req, res) => {
      res.sendFile(join(distPath, 'index.html'))
    })
  }

  return app
}
