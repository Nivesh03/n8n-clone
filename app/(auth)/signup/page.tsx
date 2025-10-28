import { RegisterForm } from '@/components/auth/register-form'
import { requireNoAuth } from '@/lib/auth-utils'

const Page = async () => {
  await requireNoAuth()
  return <RegisterForm />
}

export default Page
