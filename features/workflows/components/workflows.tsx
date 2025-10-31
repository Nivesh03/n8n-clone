'use client'
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from '@/components/entity-components'
import { useEntitySearch } from '@/hooks/use-entity-search'
import { useUpgradeModal } from '@/hooks/use-upgrade-modal'
import type { Workflow } from '@/lib/generated/prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { WorkflowIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from '../hooks/use-workflows'
import { useWorkflowsParams } from '../hooks/use-workflows-params'
export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows()
  if (workflows.data.items.length === 0) {
    return <WorkflowsEmpty />
  }
  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  )
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflow()
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

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading workflows" entity="workflows" />
}

export const WorkflowsError = () => {
  return <ErrorView message="Error loading workflows" />
}

export const WorkflowsEmpty = () => {
  const router = useRouter()
  const createWorkflow = useCreateWorkflow()
  const { handleError, modal } = useUpgradeModal()

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: handleError,
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`)
      },
    })
  }

  return (
    <>
      {modal}
      <EmptyView onNew={handleCreate} message="No workflows found." />
    </>
  )
}

export const WorkflowItem = ({ data }: { data: Workflow }) => {
  const { mutateAsync: removeWorkflow, isPending } = useRemoveWorkflow()
  const handleRemove = () => {
    removeWorkflow({ id: data.id })
  }
  return (
    <EntityItem
      href={`workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{' '}
          &bull; Created{' '}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="flex size-8 items-center justify-around">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={isPending}
    />
  )
}
