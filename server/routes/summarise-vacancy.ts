import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { runPrompt } from '../lib/claude.js'

const router = Router()

const Schema = z.object({
  vacancyText: z.string().min(50, 'Vacancy text too short'),
})

router.post('/', async (req: Request, res: Response) => {
  const parsed = Schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  try {
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
      userPrompt: parsed.data.vacancyText,
      maxTokens: 800,
      temperature: 0.1,
    })

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
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
