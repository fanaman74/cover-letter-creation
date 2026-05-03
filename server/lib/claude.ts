import Anthropic from '@anthropic-ai/sdk'

export const MODEL = 'claude-sonnet-4-5'

// Lazy singleton — defer until first call so dotenv has time to load
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export interface PromptConfig {
  systemPrompt: string
  userPrompt: string
  maxTokens: number
  temperature: number
}

export async function runPrompt(config: PromptConfig, signal?: AbortSignal): Promise<string> {
  const response = await getClient().messages.create(
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
