import OpenAI from 'openai'

export const MODEL = 'google/gemini-2.0-flash-001'

let _client: OpenAI | null = null
function getClient(): OpenAI {
  if (!_client) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required')
    }
    _client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'X-Title': 'Cover Letter Generator',
      },
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
  const maxAttempts = 4
  let lastErr: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
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
    } catch (err) {
      lastErr = err as Error
      const status = (err as { status?: number }).status
      const retryable = status === 503 || status === 502 || status === 504 || status === 429
      console.log(`[claude] attempt ${attempt}/${maxAttempts} failed: status=${status} retryable=${retryable} msg=${lastErr.message}`)
      if (!retryable || attempt === maxAttempts) throw err
      // exponential backoff: 1s, 2s, 4s
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
    }
  }
  throw lastErr ?? new Error('runPrompt failed')
}
