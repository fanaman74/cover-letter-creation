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
  'responsible for', 'helped with', 'assisted in', 'involved in', 'participated in',
  'I am the perfect candidate',
].join(', ')

const WEAK_OPENERS = [
  'I am writing to express my interest',
  'I am writing to apply',
  'I have always been passionate',
  'I am excited to apply',
  'I would like to apply',
  'Please find attached',
  'I am pleased to submit',
].join(' / ')

export function auditLetterPrompt(draft: string): PromptConfig {
  return {
    systemPrompt: `You are a cover letter editor running a mandatory final audit. Review the draft against every criterion below, fix every failure, and return ONLY the revised letter body — plain paragraphs separated by blank lines. No commentary, no salutation, no sign-off.

AUDIT CHECKLIST — fix every failure found:

1. WEAK OPENER: If the letter opens with any of these, rewrite the opening entirely: ${WEAK_OPENERS}. The opening must hook with something specific about the company or role.

2. GENERIC COMPANY REFERENCE: If paragraph 3 contains generic flattery ("I admire your innovative approach", "your reputation for excellence", "your commitment to innovation") — replace with something specific about the employer's actual work, product, or mission.

3. RESUME REHASH: If the letter simply repeats resume bullet points rather than adding context and personality, rewrite to show the story behind the achievement, not just the fact.

4. BANNED PHRASES: Remove every instance of: ${BANNED} — replace with plain, specific language.

5. PASSIVE VOICE: Rewrite any passive constructions. Zero allowed. "X was managed by me" → "I managed X". "Responsibilities included" → what you actually did.

6. NOMINALISATIONS: Fix all instances. "The management of X was undertaken" → "I managed X". "My experience has allowed me to develop" → "Working at X taught me".

7. WEAK VERBS: Replace "responsible for", "helped with", "assisted in", "involved in", "participated in" with specific action verbs that name the contribution.

8. SUPERFICIAL -ING TAILS: Remove endings like "…ensuring alignment", "…reflecting my commitment", "…contributing to your mission". End sentences with content.

9. GENERIC CLOSE: If the closing paragraph is hollow or formulaic, rewrite with a specific call to action that references the role or a concrete aspect of the employer's work.

10. SENTENCE VARIETY: If consecutive sentences are all similar length, vary them. Short sentences land harder. Longer ones earn their length by carrying real content.

11. VAGUE ATTRIBUTION: Replace "my experience in X" or "my background in Y" with specific named roles, projects, employers, or measurable outcomes.

12. LENGTH: Keep between 300–420 words. Cut padding if over; add a specific detail if under.

OUTPUT: The revised letter body only. Four paragraphs. No explanation of changes made.`,
    userPrompt: `DRAFT LETTER:\n\n${draft}`,
    maxTokens: 1200,
    temperature: 0.3,
  }
}
