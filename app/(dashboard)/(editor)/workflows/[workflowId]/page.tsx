import { requireAuth } from "@/lib/auth-utils"

interface PageProps {
  params: Promise<{
    workflowId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { workflowId } = await params
  await requireAuth()
  return <div>workflowId: {workflowId} Page</div>
}
