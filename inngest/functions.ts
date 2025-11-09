import { getExecutorType } from '@/features/executions/lib/executor-registry'
import prisma from '@/lib/db'
import { NonRetriableError } from 'inngest'
import { httpRequestChannel } from './channels/http-request'
import { manualTriggerChannel } from './channels/manual-trigger'
import { inngest } from './client'
import { topologicalSort } from './utils'

export const executeWorkflow = inngest.createFunction(
  { id: 'execute-workflow' },
  {
    event: 'workflows/execute.workflow',
    channels: [httpRequestChannel(), manualTriggerChannel()],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId
    if (!workflowId) throw new NonRetriableError('Workflow ID is required')
    const sortedNodes = await step.run('prepare-workflow', async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      })
      return topologicalSort(workflow.nodes, workflow.connections)
    })

    let context = event.data.initialData || {}
    for (const node of sortedNodes) {
      if (node.type === 'INITIAL') continue
      const executor = getExecutorType(node.type)
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      })
    }
    return {
      workflowId,
      result: context,
    }
  },
)
