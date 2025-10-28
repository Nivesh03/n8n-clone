import { requireAuth } from '@/lib/auth-utils'
import { caller } from '@/trpc/server'

export default async function Home() {
  await requireAuth()
  const data = await caller.getUsers()
  return (
    <div className="">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
