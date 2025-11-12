import { getExecutorType } from '@/features/executions/lib/executor-registry'
import prisma from '@/lib/db'
import { ExecutionStatus } from '@/lib/generated/prisma/enums'
import { NonRetriableError } from 'inngest'
import { anthropicChannel } from './channels/anthropic'
import { geminiChannel } from './channels/gemini'
import { googleFormTriggerChannel } from './channels/google-form-trigger'
import { httpRequestChannel } from './channels/http-request'
import { manualTriggerChannel } from './channels/manual-trigger'
import { openaiChannel } from './channels/openai'
import { stripeTriggerChannel } from './channels/stripe-trigger'
import { inngest } from './client'
import { topologicalSort } from './utils'

export const executeWorkflow = inngest.createFunction(
  {
    id: 'execute-workflow',
    retries: 0,
    onFailure: async ({ event }) => {
      return prisma.execution.update({
        where: {
          inngestEventId: event.data.event.id,
        },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      })
    },
  },
  {
    event: 'workflows/execute.workflow',
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openaiChannel(),
      anthropicChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id
    const workflowId = event.data.workflowId
    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError('Event Id and Workflow Id are required')
    }
    await step.run('create-execution', async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      })
    })
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
    const userId = await step.run('find-user-id', async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      })
      return workflow.userId
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
        userId,
      })
    }
    await step.run('update-execution', async () => {
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      })
    })
    return {
      workflowId,
      result: context,
    }
  },
)
