'use client'
import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function Home() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data } = useQuery(trpc.getWorkflows.queryOptions())
  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("job queued")
        queryClient.invalidateQueries(trpc.getWorkflows.queryOptions())
      },
    }),
  )
  return (
    <div className="min-h-screen flex justify-center items-center min-w-screen flex-col gap-6">
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Click
      </Button>
    </div>
  )
}
