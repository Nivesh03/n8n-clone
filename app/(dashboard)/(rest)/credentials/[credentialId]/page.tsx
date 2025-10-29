import { requireAuth } from "@/lib/auth-utils"

interface PageProps {
  params: Promise<{
    credentialId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { credentialId } = await params
  await requireAuth()
  return <div>CredentialsId: {credentialId} Page</div>
}
