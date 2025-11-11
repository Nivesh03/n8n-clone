'use client'

import { GEMINI_CHANNEL_NAME } from '@/inngest/channels/gemini'
import { useReactFlow, type Node, type NodeProps } from '@xyflow/react'
import { memo, useState } from 'react'
import { useNodeStatus } from '../../hooks/use-node-status'
import { BaseExecutionNode } from '../base-execution-node'
import { fetchGeminiRealtimeToken } from './actions'
import {
  AVAILABLE_MODELS,
  GeminiDailog,
  type GeminiFormType,
} from './gemini-dialog'

type GeminiNodeData = {
  variableName?: string
  credentialId?: string
  model?: (typeof AVAILABLE_MODELS)[number]
  userPrompt?: string
  systemPrompt?: string
}
type GeminiNodeType = Node<GeminiNodeData>

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchGeminiRealtimeToken,
  })
  const nodeData = props.data
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    : 'Not Configured'

  const handleOpenSettings = () => {
    setDialogOpen(true)
  }

  const handleSubmit = (values: GeminiFormType) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          }
        }
        return node
      }),
    )
  }

  return (
    <>
      <GeminiDailog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  )
})

GeminiNode.displayName = 'GeminiNode'
