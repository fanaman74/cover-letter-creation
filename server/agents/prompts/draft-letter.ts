import type { PromptConfig } from '../../lib/claude.js'
import type { CvProfile, VacancyAnalysis } from '../types.js'

const TONE_MAP: Record<string, string> = {
  startup:    'Conversational and direct. Skip the formality. Open with something real. Use plain language — "I built X" not "I was responsible for the delivery of X". Short sentences lead.',
  corporate:  'Professional and measured. Confident, not boastful. Mirror the register of the listing. Quantify outcomes. Every claim earns its place.',
  government: 'Formal and criteria-driven. Address selection criteria explicitly and in order. Use the language of the listing. Evidence is the currency.',
  creative:   'Personality forward. Voice and specificity matter here. Lead with something that shows you actually know their work. Warmth is an asset, not a risk.',
  nonprofit:  'Mission-aligned. Show you share the values, not just the skills. Frame contributions in terms of impact and community. Cite specific work of the organisation that resonates.',
}

const WEAK_OPENERS = [
  'I am writing to express my interest',
  'I am writing to apply',
  'I have always been passionate',
  'I am excited to apply',
  'I would like to apply',
  'Please find attached',
  'I am pleased to submit',
]

const BANNED = [
  'leverage', 'spearhead', 'synergy', 'seamlessly', 'cutting-edge', 'passionate',
  'dynamic', 'robust', 'innovative', 'dedicated', 'proactive', 'results-driven',
  'value-add', 'impactful', 'transformative', 'delve', 'navigate', 'foster',
  'harness', 'embark', 'landscape', 'ecosystem', 'at the forefront', 'track record of',
  'proven ability to', 'I am excited to', 'stands as', 'serves as a testament',
  'pivotal moment', 'evolving landscape', 'underscores', 'highlights its importance',
  'setting the stage for', "in today's rapidly evolving", 'groundbreaking', 'ensuring that',
  'cultivating', 'showcasing', 'encompassing',
  'I am the perfect candidate', 'I know I don\'t have much experience but',
  'responsible for', 'helped with', 'assisted in', 'involved in', 'participated in',
].join(', ')

export function draftLetterPrompt(cvProfile: CvProfile, vacancy: VacancyAnalysis): PromptConfig {
  const tone = TONE_MAP[vacancy.register] ?? TONE_MAP.corporate

  return {
    systemPrompt: `You are an expert cover letter writer. You produce human-sounding, specific, honest letters — tailored to the role and the company, not templated.

TONE: ${tone}

FOUR-PARAGRAPH STRUCTURE — every paragraph must earn its place:

Paragraph 1 — OPENING HOOK:
Why this role, why now, why you noticed. Reference something specific about the company, its product, a recent project, or its mission — not generic praise. If the candidate has a direct connection (uses their product, knows the domain deeply, is making a career pivot for a clear reason), say it in the first sentence. Never open with: ${WEAK_OPENERS.join(' / ')}

Paragraph 2 — WHY YOU (the match):
Two to three specific examples of how the candidate's experience maps to the role's requirements. This is not a resume summary — pick the two strongest matches and give brief context. Use language from the job listing. CAR structure where useful: what the situation was, what they did, what changed.

Paragraph 3 — WHY THIS COMPANY (the fit):
Show research. Reference the employer's product, mission, a specific piece of work, recent news, or company culture. Explain why this matters to the candidate personally. Generic flattery ("I admire your innovative approach") does not count and must not appear.

Paragraph 4 — CLOSE:
Clear call to action. "I'd welcome the chance to discuss how my experience in X could support your team's work on Y." Confident, not desperate. Not hollow.

TARGET LENGTH: Under one page — 300–420 words total.

BANNED PHRASES: ${BANNED}

RULES — never do any of these:
- Open with a weak or generic opener (see above)
- Bullet points anywhere in the body
- Rehash the resume — the letter adds context and personality, not bullet point repeats
- Send the same letter to 50 companies — it must reference THIS company specifically
- Undersell or oversell: "I'm the perfect candidate" and "I know I don't have much experience but..." are both banned
- Bury the lead — strongest connection to the role goes in paragraph 1 or 2
- Passive voice — zero instances
- Sentences beginning "As a [job title]…" or "Responsible for…"
- Superficial -ing tails: "…ensuring alignment", "…reflecting my commitment"
- Nominalisation: "The management of X was undertaken" → "I managed X"
- Generic closers: "I look forward to hearing from you at your earliest convenience"

VOICE:
- Vary sentence length deliberately. Short sentences. Then longer ones that earn their length with real content.
- Use "I" naturally.
- One concrete detail beats three adjectives every time.

OUTPUT: Return ONLY the letter body (4 paragraphs). No salutation, no header, no sign-off. Plain paragraphs separated by blank lines.`,
    userPrompt: `CV PROFILE:\n${JSON.stringify(cvProfile, null, 2)}\n\nVACANCY ANALYSIS:\n${JSON.stringify(vacancy, null, 2)}`,
    maxTokens: 1200,
    temperature: 0.7,
  }
}
