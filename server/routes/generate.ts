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
  req.on('close', () => ac.abort())

  const send = (event: object) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  await runPipeline(cvText, vacancyText, send, ac.signal)
  res.end()
})

export default router
