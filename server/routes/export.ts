import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { generateDocx } from '../lib/docx-generate.js'
import type { LetterData } from '../agents/types.js'

const router = Router()

const MetadataSchema = z.object({
  candidateName: z.string(),
  city: z.string(),
  date: z.string(),
  employerName: z.string(),
  teamUnit: z.string(),
  employerLocation: z.string(),
  roleTitle: z.string(),
  reference: z.string(),
  salutation: z.string(),
  bodyParagraphs: z.array(z.string()),
  contactDetails: z.string(),
})

const ExportSchema = z.object({
  metadata: MetadataSchema,
})

router.post('/', async (req: Request, res: Response) => {
  const parsed = ExportSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid export payload' })
    return
  }

  const metadata = parsed.data.metadata as LetterData

  try {
    const buffer = await generateDocx(metadata)
    const safeName = metadata.candidateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    res.setHeader('Content-Disposition', `attachment; filename="cover_letter_${safeName}.docx"`)
    res.send(buffer)
  } catch (err) {
    console.error('DOCX generation error:', err)
    res.status(500).json({ error: 'Failed to generate document' })
  }
})

export default router
