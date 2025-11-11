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
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from '../hooks/use-credentials'
import { useCredentialsParams } from '../hooks/use-credentials-params'
import { CredentialType } from '@/lib/generated/prisma/enums'
import type { Credential } from '@/lib/generated/prisma/client'

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.ANTHROPIC]: '/logos/anthropic.svg',
  [CredentialType.OPENAI]: '/logos/openai.svg',
  [CredentialType.GEMINI]: '/logos/gemini.svg',
}

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials()
  if (credentials.data.items.length === 0) {
    return <CredentialsEmpty />
  }
  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  )
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Credentials"
        description="Create and Manage your credentials"
        disabled={disabled}
        newButtonLabel="New Credential"
        newButtonHref="/credentials/new"
      />
    </>
  )
}

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams()
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  })
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search Credentials"
    />
  )
}

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials()
  const [params, setParams] = useCredentialsParams()

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  )
}

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  )
}

export const CredentialsLoading = () => {
  return <LoadingView message="Loading credentials" entity="credentials" />
}

export const CredentialsError = () => {
  return <ErrorView message="Error loading credentials" />
}

export const CredentialsEmpty = () => {
  const router = useRouter()

  const handleCreate = () => {
    router.push(`/credentials/new`)
  }

  return (
    <>
      <EmptyView
        onNew={handleCreate}
        message="No credentials found. You have not created any credentials yet. Get started by creating your first credential."
      />
    </>
  )
}

export const CredentialItem = ({ data }: { data: Credential }) => {
  const { mutateAsync: removeCredential, isPending } = useRemoveCredential()
  const handleRemove = () => {
    removeCredential({ id: data.id })
  }
  const logo = credentialLogos[data.type]
  return (
    <EntityItem
      href={`credentials/${data.id}`}
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
          <Image
            src={logo}
            alt={data.name}
            width={1}
            height={1}
            className="size-5 text-muted-foreground"
          />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={isPending}
    />
  )
}
