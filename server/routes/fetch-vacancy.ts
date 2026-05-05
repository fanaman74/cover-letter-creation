import { Router, Request, Response } from 'express'
import { z } from 'zod'

const router = Router()

const FetchSchema = z.object({
  url: z.string().url('Invalid URL'),
})

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 60_000)
}

router.post('/', async (req: Request, res: Response) => {
  const parsed = FetchSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }

  try {
    const response = await fetch(parsed.data.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CoverLetterBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      res.status(422).json({ error: `Could not fetch page (${response.status})` })
      return
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      res.status(422).json({ error: 'URL does not point to an HTML page' })
      return
    }

    const html = await response.text()
    const text = stripHtml(html)

    if (text.length < 100) {
      res.status(422).json({ error: 'Could not extract enough text from the page' })
      return
    }

    res.json({ text })
  } catch (err) {
    const msg = (err as Error).message
    if (msg.includes('timeout') || msg.includes('abort')) {
      res.status(422).json({ error: 'Page took too long to load (10s timeout)' })
    } else {
      res.status(422).json({ error: `Failed to fetch URL: ${msg}` })
    }
  }
})

export default router
