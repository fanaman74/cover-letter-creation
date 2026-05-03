import { Router, Request, Response } from 'express'
import multer from 'multer'
import { extractPdfText } from '../lib/pdf-extract.js'
import { extractDocxText } from '../lib/docx-extract.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    cb(null, allowed.includes(file.mimetype))
  },
})

router.post('/', upload.single('cv'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded or unsupported type (PDF/DOCX only)' })
    return
  }

  try {
    let text: string
    if (req.file.mimetype === 'application/pdf') {
      text = await extractPdfText(req.file.buffer)
    } else {
      text = await extractDocxText(req.file.buffer)
    }

    if (!text.trim()) {
      res.status(422).json({ error: 'Could not extract text from file' })
      return
    }

    res.json({ text, filename: req.file.originalname })
  } catch (err) {
    console.error('Upload extraction error:', err)
    res.status(500).json({ error: 'Failed to extract text from file' })
  }
})

export default router
