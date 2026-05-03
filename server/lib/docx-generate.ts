import { Document, Packer, Paragraph, TextRun, LineRuleType } from 'docx'
import type { LetterData } from '../agents/types.js'

// 1 mm = 56.69 twips (twentieths of a point); A4 = 210mm × 297mm
const mm = (n: number) => Math.round(n * 56.69)

const A4_WIDTH = mm(210)   // 11905
const A4_HEIGHT = mm(297)  // 16837
const MARGIN = mm(25)      // 2.5 cm = 1417

const FONT = 'Arial'
const BODY_PT = 22   // 11pt in half-points
const NAME_PT = 26   // 13pt in half-points
const LINE = 276     // 1.15 × 240 twips
const AFTER = 240    // 12pt × 20 twips

function bodyPara(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: BODY_PT })],
    spacing: { after: AFTER, line: LINE, lineRule: LineRuleType.AUTO },
  })
}

function blankLine(): Paragraph {
  return new Paragraph({
    children: [],
    spacing: { after: AFTER },
  })
}

export async function generateDocx(letter: LetterData): Promise<Buffer> {
  const children: Paragraph[] = []

  // Candidate name — bold, 13pt
  children.push(
    new Paragraph({
      children: [new TextRun({ text: letter.candidateName, bold: true, font: FONT, size: NAME_PT })],
      spacing: { after: 0 },
    })
  )

  // City, Date
  children.push(bodyPara(`${letter.city}, ${letter.date}`))
  children.push(blankLine())

  // Employer address block
  children.push(bodyPara(letter.employerName))
  if (letter.teamUnit) children.push(bodyPara(letter.teamUnit))
  children.push(bodyPara(letter.employerLocation))
  children.push(blankLine())

  // Re: line
  const refSuffix = letter.reference ? ` — ${letter.reference}` : ''
  children.push(bodyPara(`Re: Application — ${letter.roleTitle}${refSuffix}`))
  children.push(blankLine())

  // Salutation
  children.push(bodyPara(`${letter.salutation},`))
  children.push(blankLine())

  // Body paragraphs
  for (const para of letter.bodyParagraphs) {
    children.push(bodyPara(para))
  }
  children.push(blankLine())

  // Close
  children.push(bodyPara('Yours sincerely,'))
  children.push(blankLine())
  children.push(bodyPara(letter.candidateName))
  if (letter.contactDetails) {
    children.push(bodyPara(letter.contactDetails))
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_WIDTH, height: A4_HEIGHT },
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}
