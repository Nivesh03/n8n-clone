import type { NodeExecutor } from '@/features/executions/types'
import { anthropicChannel } from '@/inngest/channels/anthropic'
import prisma from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import handlebars from 'handlebars'
import { NonRetriableError } from 'inngest'
import type { AVAILABLE_MODELS } from './anthropic-dialog'
handlebars.registerHelper('json', (context) => {
  const json = JSON.stringify(context, null, 2)
  return new handlebars.SafeString(json)
})

type AnthropicData = {
  variableName?: string
  credentialId?: string
  model?: (typeof AVAILABLE_MODELS)[number]
  userPrompt?: string
  systemPrompt?: string
}

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: 'loading',
    }),
  )
  if (!data.variableName || !data.userPrompt || !data.credentialId) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: 'error',
      }),
    )
    throw new NonRetriableError(
      'Anthropic Node: Missing properties. Variable name, user prompt are required',
    )
  }
  const systemPrompt = data.systemPrompt
    ? handlebars.compile(data.systemPrompt)(context)
    : 'You are a helpful assistant.'
  const userPrompt = handlebars.compile(data.userPrompt)(context)
  const credential = await step.run('get-credential', () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    })
  })
  if (!credential)
    throw new NonRetriableError('Anthropic Node: Credential not found')

  const anthropic = createAnthropic({
    apiKey: decrypt(credential.value),
  })

  try {
    const { steps } = await step.ai.wrap(
      'anthropic-generate-text',
      generateText,
      {
        model: anthropic(data.model || 'claude-3-7-sonnet-latest'),
        system: systemPrompt,
        prompt: userPrompt,
      },
    )
    const text =
      steps[0].content[0].type === 'text' ? steps[0].content[0].text : ''

    await publish(
      anthropicChannel().status({
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
      anthropicChannel().status({
        nodeId,
        status: 'error',
      }),
    )
    throw error
  }
}
