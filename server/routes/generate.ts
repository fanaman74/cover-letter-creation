import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { runPipeline } from '../agents/runner.js'

const router = Router()

const GenerateSchema = z.object({
  cvText: z.string().min(100, 'CV text too short'),
  vacancyText: z.string().min(50, 'Vacancy text too short'),
})

router.post('/', async (req: Request, res: Response) => {
  const parsed = GenerateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { cvText, vacancyText } = parsed.data

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const ac = new AbortController()
  res.on('close', () => ac.abort())

  const send = (event: object) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  // Heartbeat every 8s keeps the SSE connection alive through proxies/browsers
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(': ping\n\n')
  }, 8000)

  try {
    await runPipeline(cvText, vacancyText, send, ac.signal)
  } finally {
    clearInterval(heartbeat)
  }
  res.end()
})

export default router
