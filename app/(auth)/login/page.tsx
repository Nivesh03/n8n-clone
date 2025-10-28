import { LoginForm } from '@/components/auth/login-form'
import { requireNoAuth } from '@/lib/auth-utils'

const Page = async () => {
  await requireNoAuth()
  return <LoginForm />
}

export default Page
