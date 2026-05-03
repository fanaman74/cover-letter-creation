import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required')
}

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export const MODEL = 'claude-sonnet-4-5'

export interface PromptConfig {
  systemPrompt: string
  userPrompt: string
  maxTokens: number
  temperature: number
}

export async function runPrompt(config: PromptConfig, signal?: AbortSignal): Promise<string> {
  const response = await anthropic.messages.create(
    {
      model: MODEL,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: config.userPrompt }],
    },
    { signal }
  )
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}
