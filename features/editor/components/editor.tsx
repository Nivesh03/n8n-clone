'use client'
import { ErrorView, LoadingView } from '@/components/entity-components'
import { nodeComponents } from '@/config/node-components'
import { useSuspenseWorkflow } from '@/features/workflows/hooks/use-workflows'
import { NodeType } from '@/lib/generated/prisma/enums'
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from '@xyflow/react'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { editorAtom } from '../store/atoms'
import { AddNodeButton } from './add-node-button'
import { ExecuteWorkflowButton } from './execute-workflow-button'

export const EditorLoading = () => {
  return <LoadingView message="Loading Editor..." />
}

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId)
  const setEditor = useSetAtom(editorAtom)
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes)
  const [edges, setEdges] = useState<Edge[]>(workflow.edges)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  )
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  )
  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER)
  }, [nodes])
  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={{
          hideAttribution: true,
        }}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        snapToGrid
        snapGrid={[10, 10]}
        panOnScroll
        fitView
      >
        <Background variant={BackgroundVariant.Lines} />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
