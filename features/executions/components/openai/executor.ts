import type { NodeExecutor } from '@/features/executions/types'
import { openaiChannel } from '@/inngest/channels/openai'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import handlebars from 'handlebars'
import { NonRetriableError } from 'inngest'
import type { AVAILABLE_MODELS } from './openai-dialog'
handlebars.registerHelper('json', (context) => {
  const json = JSON.stringify(context, null, 2)
  return new handlebars.SafeString(json)
})

type OpenAiData = {
  variableName?: string
  model?: (typeof AVAILABLE_MODELS)[number]
  userPrompt?: string
  systemPrompt?: string
}

export const openAiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    openaiChannel().status({
      nodeId,
      status: 'loading',
    }),
  )
  if (!data.variableName || !data.userPrompt) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: 'error',
      }),
    )
    throw new NonRetriableError(
      'Open AI Node: Missing properties. Variable name, user prompt are required',
    )
  }
  const systemPrompt = data.systemPrompt
    ? handlebars.compile(data.systemPrompt)(context)
    : 'You are a helpful assistant.'
  const userPrompt = handlebars.compile(data.userPrompt)(context)
  const credentialValue = process.env.OPENAI_API_KEY
  const openai = createOpenAI({
    apiKey: credentialValue,
  })

  try {
    const { steps } = await step.ai.wrap('openai-generate-text', generateText, {
      model: openai(data.model || 'gpt-4o'),
      system: systemPrompt,
      prompt: userPrompt,
    })
    const text =
      steps[0].content[0].type === 'text' ? steps[0].content[0].text : ''

    await publish(
      openaiChannel().status({
        nodeId,
        status: 'success',
      }),
    )
    return {
      ...context,
      [data.variableName]: {
        text,
      },
    }
  } catch (error) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: 'error',
      }),
    )
    throw error
  }
}
