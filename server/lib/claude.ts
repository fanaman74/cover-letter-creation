import OpenAI from 'openai'

export const MODEL = 'google/gemma-4-27b-it:free'

let _client: OpenAI | null = null
function getClient(): OpenAI {
  if (!_client) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required')
    }
    _client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })
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
  const response = await getClient().chat.completions.create(
    {
      model: MODEL,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: config.userPrompt },
      ],
    },
    { signal }
  )
  const text = response.choices[0]?.message?.content
  if (!text) throw new Error('Empty response from model')
  return text
}
