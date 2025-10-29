import { inngest } from '@/inngest/client'
import prisma from '@/lib/db'
import { createTRPCRouter, protectedProcedure } from '../init'

export const appRouter = createTRPCRouter({
  testAI: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: 'execute/ai',
    })
  }),
  getWorkflows: protectedProcedure.query(() => {
    return prisma.workflow.findMany()
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: 'test/hello.world',
      data: {
        email: 'nivesh@gmail.com',
      },
    })

    return { success: true, message: 'Job queued' }
  }),
})
// export type definition of API
export type AppRouter = typeof appRouter
