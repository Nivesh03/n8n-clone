'use client'

import { ANTHROPIC_CHANNEL_NAME } from '@/inngest/channels/anthropic'
import { useReactFlow, type Node, type NodeProps } from '@xyflow/react'
import { memo, useState } from 'react'
import { useNodeStatus } from '../../hooks/use-node-status'
import { BaseExecutionNode } from '../base-execution-node'
import { fetchAnthropicRealtimeToken } from './actions'
import {
  AVAILABLE_MODELS,
  AnthropicDialog,
  type AnthropicFormType,
} from './anthropic-dialog'

type AnthropicNodeData = {
  variableName?: string
  credentialId?: string
  model?: (typeof AVAILABLE_MODELS)[number]
  userPrompt?: string
  systemPrompt?: string
}
type AnthropicNodeType = Node<AnthropicNodeData>

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: ANTHROPIC_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchAnthropicRealtimeToken,
  })
  const nodeData = props.data
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    : 'Not Configured'

  const handleOpenSettings = () => {
    setDialogOpen(true)
  }

  const handleSubmit = (values: AnthropicFormType) => {
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
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  )
})

AnthropicNode.displayName = 'AnthropicNode'
