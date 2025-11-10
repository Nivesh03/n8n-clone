import type { NodeExecutor } from '@/features/executions/types'
import { httpRequestChannel } from '@/inngest/channels/http-request'
import handlebars from 'handlebars'
import { NonRetriableError } from 'inngest'
import ky, { type Options as KyOptions } from 'ky'

handlebars.registerHelper('json', (context) => {
  const json = JSON.stringify(context, null, 2)
  return new handlebars.SafeString(json)
})

type HttpRequestData = {
  variableName?: string
  endpoint?: string
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH'
  body?: string
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: 'loading',
    }),
  )

  try {
    const result = step.run('http-request', async () => {
      if (!data.endpoint) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: 'error',
          }),
        )
        throw new NonRetriableError('HTTP request node: Endpoint is required')
      }
      if (!data.variableName) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: 'error',
          }),
        )
        throw new NonRetriableError(
          'HTTP request node: Variable name is required',
        )
      }
      if (!data.method) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: 'error',
          }),
        )
        throw new NonRetriableError('HTTP request node: Method is required')
      }
      const endpoint = handlebars.compile(data.endpoint)(context)
      const method = data.method
      const options: KyOptions = { method }
      if (['PUT', 'POST', 'DELETE'].includes(method)) {
        const resolved = handlebars.compile(data.body)(context)
        JSON.parse(resolved)
        options.body = resolved
        options.headers = {
          'Content-Type': 'application/json',
        }
      }
      const res = await ky(endpoint, options)
      const contentType = res.headers.get('content-type')

      const resData = contentType?.includes('application/json')
        ? await res.json()
        : await res.text()
      const responsePayload = {
        ...context,
        httpResponse: {
          status: res.status,
          statusText: res.statusText,
          data: resData,
        },
      }
      await publish(
        httpRequestChannel().status({
          nodeId,
          status: 'success',
        }),
      )
      return {
        ...context,
        [data.variableName]: responsePayload,
      }
    })
    return result
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: 'error',
      }),
    )
    if (error instanceof Error) {
      throw new NonRetriableError(`HTTP request node: ${error.message}`)
    }
    throw error
  }
}
