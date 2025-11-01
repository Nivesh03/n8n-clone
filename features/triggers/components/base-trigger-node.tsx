'use client'

import { BaseHandle } from '@/components/react-flow/base-handle'
import { BaseNode, BaseNodeContent } from '@/components/react-flow/base-node'
import {
  NodeStatusIndicator,
  type NodeStatus,
} from '@/components/react-flow/node-status-indicator'
import { WorkflowNode } from '@/components/workflow-node'
import { Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { memo } from 'react'

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string
  name: string
  description?: string
  children?: React.ReactNode
  status?: NodeStatus
  onSettings?: () => void
  onDoubleClick?: () => void
}

export const BaseTriggerNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
    status = 'initial',
  }: BaseTriggerNodeProps) => {
    const { setNodes, setEdges } = useReactFlow()
    const handleDelete = () => {
      setNodes((currNodes) => {
        const updatedNodes = currNodes.filter((node) => node.id !== id)
        return updatedNodes
      })
      setEdges((currEdges) => {
        const updatedEdges = currEdges.filter(
          (edge) => edge.source !== id && edge.target !== id,
        )
        return updatedEdges
      })
    }
    return (
      <WorkflowNode
        showToolbar={true}
        name={name}
        description={description}
        onSettings={onSettings}
        onDelete={handleDelete}
      >
        <NodeStatusIndicator
          status={status}
          variant="border"
          className="rounded-l-2xl"
        >
          <BaseNode
            status={status}
            onDoubleClick={onDoubleClick}
            className="rounded-l-2xl relative group"
          >
            <BaseNodeContent>
              {typeof Icon === 'string' ? (
                <Image src={Icon} alt={name} width={16} height={16} />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
              {children}
            </BaseNodeContent>
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    )
  },
)

BaseTriggerNode.displayName = 'BaseTriggerNode'
