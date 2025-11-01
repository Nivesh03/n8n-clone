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

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string
  name: string
  description?: string
  children?: React.ReactNode
  status?: NodeStatus
  onSettings?: () => void
  onDoubleClick?: () => void
}

export const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
    status = 'initial',
  }: BaseExecutionNodeProps) => {
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
        <NodeStatusIndicator status={status} variant='border'>
          <BaseNode status={status} onDoubleClick={onDoubleClick}>
            <BaseNodeContent>
              {typeof Icon === 'string' ? (
                <Image src={Icon} alt={name} width={16} height={16} />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
              {children}
            </BaseNodeContent>
            <BaseHandle id="target-1" type="target" position={Position.Left} />
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    )
  },
)

BaseExecutionNode.displayName = 'BaseExecutionNode'
