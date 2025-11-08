'use client'

import { useReactFlow, type Node, type NodeProps } from '@xyflow/react'
import { GlobeIcon } from 'lucide-react'
import { memo, useState } from 'react'
import { BaseExecutionNode } from '../base-execution-node'
import { HttpRequestDialog, type HTTPFormType } from './http-request-dialog'

type HttpRequestNodeData = {
  endpoint?: string
  method?: 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE'
  body?: string
}
type HttpRequestNodeType = Node<HttpRequestNodeData>

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { setNodes } = useReactFlow()
  const nodeStatus = 'initial'
  const nodeData = props.data
  const description = nodeData?.endpoint
    ? `${nodeData.method || 'GET'}: ${nodeData.endpoint}`
    : 'Not Configured'

  const handleOpenSettings = () => {
    setDialogOpen(true)
  }

  const handleSubmit = ({ body, endpoint, method }: HTTPFormType) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              endpoint: endpoint,
              method: method,
              body: body,
            },
          }
        }
        return node
      }),
    )
  }

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  )
})

HttpRequestNode.displayName = 'HttpRequestNode'
