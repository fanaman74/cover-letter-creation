import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { runPrompt } from '../lib/claude.js'

const router = Router()

const RefineSchema = z.object({
  letterText: z.string().min(50),
  prompt: z.string().min(3, 'Prompt too short'),
})

router.post('/', async (req: Request, res: Response) => {
  const parsed = RefineSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  const { letterText, prompt } = parsed.data

  try {
    const refined = await runPrompt({
      systemPrompt: `You are a cover letter editor. The user will give you a cover letter and an instruction. Apply the instruction precisely and return ONLY the revised letter body — plain paragraphs separated by blank lines, no salutation, no sign-off, no commentary. Preserve everything not explicitly changed.`,
      userPrompt: `INSTRUCTION: ${prompt}\n\nCURRENT LETTER:\n\n${letterText}`,
      maxTokens: 1200,
      temperature: 0.4,
    })
    res.json({ letterText: refined.trim() })
  } catch (err) {
    console.error('Refine error:', err)
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
