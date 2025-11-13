import type { NodeExecutor } from '@/features/executions/types'
import { geminiChannel } from '@/inngest/channels/gemini'
import prisma from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import handlebars from 'handlebars'
import { NonRetriableError } from 'inngest'
import type { AVAILABLE_MODELS } from './gemini-dialog'
handlebars.registerHelper('json', (context) => {
  const json = JSON.stringify(context, null, 2)
  return new handlebars.SafeString(json)
})

type GeminiData = {
  variableName?: string
  credentialId?: string
  model?: (typeof AVAILABLE_MODELS)[number]
  userPrompt?: string
  systemPrompt?: string
}

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  userId,
}) => {
  await publish(
    geminiChannel().status({
      nodeId,
      status: 'loading',
    }),
  )
  if (!data.variableName || !data.userPrompt || !data.credentialId) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: 'error',
      }),
    )
    throw new NonRetriableError(
      'Gemini Node: Missing properties. Variable name, user prompt, credentialId are required',
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
    throw new NonRetriableError('Gemini Node: Credential not found')

  const google = createGoogleGenerativeAI({
    apiKey: decrypt(credential.value),
  })

  try {
    const { steps } = await step.ai.wrap('gemini-generate-text', generateText, {
      model: google(data.model || 'gemini-2.0-flash'),
      system: systemPrompt,
      prompt: userPrompt,
    })
    const text =
      steps[0].content[0].type === 'text' ? steps[0].content[0].text : ''

    await publish(
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: 'error',
      }),
    )
    console.error(error)
    throw new NonRetriableError('Gemini Node: Error generating text')
  }
}
