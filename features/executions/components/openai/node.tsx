'use client'

import { OPENAI_CHANNEL_NAME } from '@/inngest/channels/openai'
import { useReactFlow, type Node, type NodeProps } from '@xyflow/react'
import { memo, useState } from 'react'
import { useNodeStatus } from '../../hooks/use-node-status'
import { BaseExecutionNode } from '../base-execution-node'
import { fetchOpenAiRealtimeToken } from './actions'
import {
  AVAILABLE_MODELS,
  OpenAiDailog,
  type OpenAiFormType,
} from './openai-dialog'

type OpenAiNodeData = {
  variableName?: string
  credentialId?: string
  model?: (typeof AVAILABLE_MODELS)[number]
  userPrompt?: string
  systemPrompt?: string
}
type OpenAiNodeType = Node<OpenAiNodeData>

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchOpenAiRealtimeToken,
  })
  const nodeData = props.data
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    : 'Not Configured'

  const handleOpenSettings = () => {
    setDialogOpen(true)
  }

  const handleSubmit = (values: OpenAiFormType) => {
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
      <OpenAiDailog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        name="OpenAI"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  )
})

OpenAiNode.displayName = 'OpenAiNode'
