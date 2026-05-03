import * as pdfjsLib from 'pdfjs-dist'

// Disable worker in Node environment
pdfjsLib.GlobalWorkerOptions.workerSrc = ''

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer)
  const doc = await pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise

  const pageTexts: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()

    type Item = { str: string; transform: number[] }
    const items = content.items as Item[]

    let lastY: number | null = null
    let lines: string[] = []
    let currentLine = ''

    for (const item of items) {
      const y = item.transform[5]
      if (lastY !== null && Math.abs(y - lastY) > 5) {
        if (currentLine.trim()) lines.push(currentLine.trim())
        currentLine = item.str
      } else {
        currentLine += item.str
      }
      lastY = y
    }
    if (currentLine.trim()) lines.push(currentLine.trim())

    pageTexts.push(lines.join('\n'))
  }

  return pageTexts.join('\n\n').slice(0, 50_000)
}
