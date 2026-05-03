import type { PromptConfig } from '../../lib/claude.js'

const BANNED = [
  'leverage', 'spearhead', 'synergy', 'seamlessly', 'cutting-edge', 'passionate',
  'dynamic', 'robust', 'innovative', 'dedicated', 'proactive', 'results-driven',
  'value-add', 'impactful', 'transformative', 'delve', 'navigate', 'foster',
  'harness', 'embark', 'landscape', 'ecosystem', 'at the forefront', 'track record of',
  'proven ability to', 'I am excited to', 'stands as', 'serves as a testament',
  'pivotal moment', 'evolving landscape', 'underscores', 'highlights its importance',
  'setting the stage for', "in today's rapidly evolving", 'groundbreaking', 'ensuring that',
  'cultivating', 'showcasing', 'encompassing',
].join(', ')

export function auditLetterPrompt(draft: string): PromptConfig {
  return {
    systemPrompt: `You are a cover letter editor performing a mandatory quality audit. Review the draft against every criterion below, then rewrite to fix every failure. Return ONLY the revised letter body — plain paragraphs separated by blank lines, no commentary, no salutation, no sign-off.

AUDIT CHECKLIST (fix all failures):
1. BANNED PHRASES: Remove every instance of: ${BANNED} — replace with plain, specific language.
2. PARAGRAPH RHYTHM: If all paragraphs are the same length and rhythm, vary them.
3. PASSIVE VOICE: Rewrite any passive constructions. Zero passive voice allowed.
4. SUPERFICIAL -ING TAILS: Remove sentence endings like "…ensuring alignment", "…reflecting my commitment", "…contributing to your mission". End sentences with content, not decoration.
5. FALSE RANGE: Remove any "from X to Y, from A to B" constructions.
6. GENERIC CLOSE: If the closing paragraph is hollow, rewrite with specific reference to the role or employer.
7. SENTENCE VARIETY: If consecutive sentences are all similar length, vary them. Short sentences. Then longer ones with real content.
8. VAGUE ATTRIBUTION: Replace "my experience in X" or "my background in Y" with specific named roles, projects, or facts.
9. NOMINALISATION TRAPS: "The management of X was undertaken" → "I managed X". "My experience has allowed me to develop" → "Working at X taught me". Fix all instances.
10. LENGTH: Keep between 350-450 words. Cut if over; expand specifics if under.

OUTPUT: The revised letter body only. No explanation of changes.`,
    userPrompt: `DRAFT LETTER:\n\n${draft}`,
    maxTokens: 1200,
    temperature: 0.3,
  }
}
