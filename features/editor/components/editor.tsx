'use client'
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { ErrorView, LoadingView } from '@/components/entity-components'
import { useSuspenseWorkflow } from '@/features/workflows/hooks/use-workflows'
import '@xyflow/react/dist/style.css';

export const EditorLoading = () => {
  return <LoadingView message="Loading Editor..." />
}

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />
}

const initialNode = [
  {
    id: "n1", position: { x: 0, y: 0 }, data: { label: 'Node 1' }
  },
  {
    id: "n2", position: { x: 0, y: 100 }, data: { label: 'Node 2' }
  }
]

const initalEdges = [
  {
    id: "n1-n2", source: "n1", target: "n2"
  }
]

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId)
  return <pre>{JSON.stringify(workflow, null, 2)}</pre>
}
