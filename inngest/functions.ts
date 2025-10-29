import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { inngest } from './client'

const google = createGoogleGenerativeAI()
export const execute = inngest.createFunction(
  { id: 'execute-ai' },
  { event: 'execute/ai' },
  async ({ event, step }) => {
    const { steps } = await step.ai.wrap(
      'gemini-generative-text',
      generateText,
      {
        system: 'you are a helpful assistant',
        prompt: 'what is 52 factorial',
        model: google('gemini-2.5-flash'),
      },
    )
    return steps
  },
)
