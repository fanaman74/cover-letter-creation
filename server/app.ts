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

const __dirname = dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.use('/api/health', healthRouter)
  app.use('/api/upload', uploadRouter)
  app.use('/api/generate', generateRouter)
  app.use('/api/export', exportRouter)
  app.use('/api/refine', refineRouter)

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
