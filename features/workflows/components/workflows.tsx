'use client'
import {
  EntityContainer,
  EntityHeader,
  EntityPagination,
  EntitySearch,
} from '@/components/entity-components'
import { useEntitySearch } from '@/hooks/use-entity-search'
import { useUpgradeModal } from '@/hooks/use-upgrade-modal'
import { useRouter } from 'next/navigation'
import { useCreateworkflow, useSuspenseWorkflows } from '../hooks/use-workflows'
import { useWorkflowsParams } from '../hooks/use-workflows-params'

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

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams()
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  })
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Workflows"
    />
  )
}

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows()
  const [params, setParams] = useWorkflowsParams()

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
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
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  )
}
