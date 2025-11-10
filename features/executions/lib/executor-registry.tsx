import { googleFormTriggerExecutor } from '@/features/triggers/components/google-form-trigger/executor'
import { manualTriggerExecutor } from '@/features/triggers/components/manual-trigger/executor'
import { stripeTriggerExecutor } from '@/features/triggers/components/stripe-trigger/executor'
import { NodeType } from '@/lib/generated/prisma/enums'
import { httpRequestExecutor } from '../components/http-request/executor'
import type { NodeExecutor } from '../types'

type ExecutableNodeType = Exclude<keyof typeof NodeType, 'INITIAL'>

export const executeRegistry: Record<ExecutableNodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
}

export const getExecutorType = (type: ExecutableNodeType): NodeExecutor => {
  const executor = executeRegistry[type]
  if (!executor) throw new Error(`Executor not found for type ${type}`)
  return executor
}
