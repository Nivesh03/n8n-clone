import { RegisterForm } from '@/components/auth/register-form'
import { requireNoAuth } from '@/lib/auth-utils'

export default async function Page() {
  await requireNoAuth()
  return <RegisterForm />
}
