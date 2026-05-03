import type { PromptConfig } from '../../lib/claude.js'
import type { CvProfile } from '../types.js'

export function vacancyReviewPrompt(cvProfile: CvProfile, vacancyText: string): PromptConfig {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return {
    systemPrompt: `You are a recruitment analyst. Given a candidate CV profile and a vacancy announcement, extract structured data and perform gap analysis. Return ONLY valid JSON — no markdown fences, no commentary:
{
  "employerName": string,
  "teamUnit": string,
  "mandate": string,
  "roleTitle": string,
  "reference": string,
  "contractType": string,
  "grade": string,
  "employerLocation": string,
  "register": "eu" | "un" | "private" | "ngo",
  "selectionCriteria": {
    "essential": [string],
    "advantageous": [string],
    "implicit": [string]
  },
  "keyLanguage": [string],
  "gaps": [{ "criterion": string, "transferableEvidence": string }],
  "salutation": string
}

Register classification:
- "eu": EU institution or agency
- "un": UN or international organisation
- "private": private sector company
- "ngo": NGO or civil society

Salutation rules:
- EU/UN employer → "Dear Selection Board"
- Private sector → "Dear Hiring Manager"
- If hiring manager name found in vacancy → "Dear [Name]"

keyLanguage: 3-5 specific phrases from the vacancy that should be echoed (not copied) in the letter.
gaps: only criteria where the CV provides weak or no direct evidence. Provide the strongest available transferable evidence from the CV profile.
Today's date for context: ${today}`,
    userPrompt: `CV PROFILE:\n${JSON.stringify(cvProfile, null, 2)}\n\nVACANCY ANNOUNCEMENT:\n${vacancyText}`,
    maxTokens: 2000,
    temperature: 0.1,
  }
}
