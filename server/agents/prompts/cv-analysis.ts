import type { PromptConfig } from '../../lib/claude.js'

export function cvAnalysisPrompt(cvText: string): PromptConfig {
  return {
    systemPrompt: `You are a CV analyst. Extract a structured profile from the provided CV text. Return ONLY valid JSON matching this exact schema — no markdown fences, no commentary:
{
  "name": string,
  "location": string,
  "currentRole": string,
  "currentEmployer": string,
  "contractType": string,
  "careerArc": [{ "employer": string, "title": string, "dates": string, "highlights": [string] }],
  "coreCompetencies": [string],
  "education": [{ "institution": string, "degree": string, "year": string }],
  "certifications": [{ "name": string, "body": string, "year": string }],
  "languages": [{ "language": string, "level": string }],
  "contactDetails": string,
  "narrativeHooks": [string]
}

Rules:
- careerArc: reverse chronological, 1-2 highlights per role with quantifiable scope where present
- coreCompetencies: 8-12 specific named tools, frameworks, standards, or domains (no vague descriptors)
- narrativeHooks: exactly 2-3 distinctive career moments that are specific, evidenced, and unlikely to appear in a generic CV — investigations resolved after prior failures, projects of unusual scale, awards, first-of-its-kind deployments
- contactDetails: email/phone/LinkedIn in a single line, or empty string if absent
- If a field cannot be determined, use an empty string or empty array`,
    userPrompt: cvText,
    maxTokens: 2000,
    temperature: 0.1,
  }
}
