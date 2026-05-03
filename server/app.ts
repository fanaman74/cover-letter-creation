import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import uploadRouter from './routes/upload.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.use('/api/health', healthRouter)
  app.use('/api/upload', uploadRouter)

  return app
}
