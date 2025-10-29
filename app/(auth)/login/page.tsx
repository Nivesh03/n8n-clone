import { LoginForm } from '@/components/auth/login-form'
import { requireNoAuth } from '@/lib/auth-utils'

export default async function Page() {
  await requireNoAuth()
  return <LoginForm />
}
