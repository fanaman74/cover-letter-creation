import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { runPrompt } from '../lib/claude.js'

const router = Router()

const Schema = z.object({
  vacancyText: z.string().min(50, 'Vacancy text too short'),
})

router.post('/', async (req: Request, res: Response) => {
  console.log('[summarise] request received, body length:', JSON.stringify(req.body ?? {}).length)
  const parsed = Schema.safeParse(req.body)
  if (!parsed.success) {
    console.log('[summarise] validation failed:', parsed.error.issues[0].message)
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  console.log('[summarise] vacancyText length:', parsed.data.vacancyText.length)

  // Cap input to prevent timeouts on very long pages
  const vacancyText = parsed.data.vacancyText.length > 30000
    ? parsed.data.vacancyText.slice(0, 30000)
    : parsed.data.vacancyText

  try {
    console.log('[summarise] calling Gemini...')
    const startTime = Date.now()
    const summary = await runPrompt({
      systemPrompt: `Extract key facts from the vacancy announcement. Return ONLY valid JSON — no markdown fences, no commentary:
{
  "employer": string,
  "role": string,
  "location": string,
  "contractType": string,
  "reference": string,
  "deadline": string,
  "essentialCriteria": [string],
  "advantageousCriteria": [string],
  "keyResponsibilities": [string]
}

Rules:
- employer: full organisation name
- role: exact job title
- location: city/country or "Remote" if specified
- contractType: "Permanent", "Fixed-term", "Freelance", "Internship", or "Unknown"
- reference: vacancy/reference number if present, else ""
- deadline: application deadline if present, else ""
- essentialCriteria: up to 6 must-have requirements (qualifications, experience, skills)
- advantageousCriteria: up to 4 nice-to-have requirements
- keyResponsibilities: up to 5 main duties in plain language`,
      userPrompt: vacancyText,
      maxTokens: 800,
      temperature: 0.1,
    })
    console.log('[summarise] Gemini responded in', Date.now() - startTime, 'ms, length:', summary.length)

    // Robust JSON extraction
    const objStart = summary.indexOf('{')
    const end = summary.lastIndexOf('}')
    const clean = objStart !== -1 && end > objStart ? summary.slice(objStart, end + 1) : summary
    let data
    try {
      data = JSON.parse(clean)
    } catch {
      // Try fixing unescaped newlines/tabs inside strings
      const fixed = clean.replace(/(?<=:\s*"(?:[^"\\]|\\.)*)[\n\r\t](?=(?:[^"\\]|\\.)*")/g, ' ')
      data = JSON.parse(fixed)
    }
    console.log('[summarise] success, returning data')
    res.json(data)
  } catch (err) {
    console.error('[summarise] error:', (err as Error).message, (err as Error).stack)
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
