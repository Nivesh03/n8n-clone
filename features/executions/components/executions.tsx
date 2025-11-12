'use client'
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from '@/components/entity-components'
import type { Execution } from '@/lib/generated/prisma/client'
import { ExecutionStatus } from '@/lib/generated/prisma/enums'
import { formatDistanceToNow } from 'date-fns'
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from 'lucide-react'
import { useSuspenseExecutions } from '../hooks/use-executions'
import { useExecutionsParams } from '../hooks/use-executions-params'

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />
    default:
      return <ClockIcon className="size-5 text-gray-600" />
  }
}
const formatStatus = (status: ExecutionStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}
export const ExecutionsList = () => {
  const executions = useSuspenseExecutions()
  if (executions.data.items.length === 0) {
    return <ExecutionsEmpty />
  }
  return (
    <EntityList
      items={executions.data.items}
      getKey={(executions) => executions.id}
      renderItem={(executions) => <ExecutionItem data={executions} />}
      emptyView={<ExecutionsEmpty />}
    />
  )
}

export const ExecutionsHeader = () => {
  return (
    <>
      <EntityHeader
        title="Executions"
        description="View your executions history"
      />
    </>
  )
}

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions()
  const [params, setParams] = useExecutionsParams()

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  )
}

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  )
}

export const ExecutionsLoading = () => {
  return <LoadingView message="Loading executions" entity="executions" />
}

export const ExecutionsError = () => {
  return <ErrorView message="Error loading executions" />
}

export const ExecutionsEmpty = () => {
  return (
    <>
      <EmptyView message="No executions found. You have not created made any executions yet. Get started by running your first workflow." />
    </>
  )
}

export const ExecutionItem = ({
  data,
}: {
  data: Execution & {
    workflow: {
      id: string
      name: string
    }
  }
}) => {
  const duration = data.completedAt
    ? Math.round((data.completedAt.getTime() - data.startedAt.getTime()) / 1000)
    : null
  const subtitle = (
    <>
      {data.workflow.name} &bull;
      {formatDistanceToNow(data.startedAt, { addSuffix: true })}
      {!!duration && <>&bull; Took {duration} seconds</>}
    </>
  )
  return (
    <EntityItem
      href={`executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={subtitle}
      image={getStatusIcon(data.status)}
    />
  )
}
