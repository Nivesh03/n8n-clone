'use client'
import { EntityContainer, EntityHeader } from '@/components/entity-components'
import { useUpgradeModal } from '@/hooks/use-upgrade-modal'
import { useRouter } from 'next/navigation'
import { useCreateworkflow, useSuspenseWorkflows } from '../hooks/use-workflows'

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows()
  return <pre>{JSON.stringify(workflows.data, null, 2)}</pre>
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateworkflow()
  const { handleError, modal } = useUpgradeModal()
  const router = useRouter()
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error)
      },
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`)
      },
    })
  }
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and Manage your workflows"
        onNew={handleCreate}
        disabled={disabled}
        newButtonLabel="New Workflow"
        isCreating={createWorkflow.isPending}
      />
    </>
  )
}

export const WorkflowContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      pagination={<></>}
      search={<></>}
    >
      {children}
    </EntityContainer>
  )
}
