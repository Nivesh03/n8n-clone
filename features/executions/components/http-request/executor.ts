import type { NodeExecutor } from '@/features/executions/types'
import { NonRetriableError } from 'inngest'
import ky, { type Options as KyOptions } from 'ky'
type HttpRequestData = {
  endpoint?: string
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH'
  body?: string
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.endpoint) {
    throw new NonRetriableError('HTTP request node: Endpoint is required')
  }

  const result = step.run('http-request', async () => {
    const endpoint = data.endpoint || ''
    const method = data.method || 'GET'
    const options: KyOptions = { method }
    if (['PUT', 'POST', 'DELETE'].includes(method)) {
      options.body = data.body
    }
    const res = await ky(endpoint, options)
    const contentType = res.headers.get('content-type')

    const resData = contentType?.includes('application/json')
      ? await res.json()
      : await res.text()

    return {
      ...context,
      httpResponse: {
        status: res.status,
        statusText: res.statusText,
        data: resData,
      },
    }
  })
  return result
}
