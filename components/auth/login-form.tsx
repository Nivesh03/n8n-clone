'use client'

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'

const loginSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' }),
})
type LoginSchema = z.infer<typeof loginSchema>
const LoginForm = () => {
  const router = useRouter()
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const onSubmit = async (data: LoginSchema) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: '/',
      },
      {
        onSuccess: () => {
          router.push('/')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    )
  }
  const signInWithGithub = async () => {
    await authClient.signIn.social(
      {
        provider: 'github',
      },
      {
        onSuccess: () => {
          router.push('/')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    )
  }
  const signInWithGoogle = async () => {
    await authClient.signIn.social(
      {
        provider: 'google',
      },
      {
        onSuccess: () => {
          router.push('/')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    )
  }
  const isPending = form.formState.isSubmitting
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col justify-center items-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Button
                variant={'outline'}
                type="button"
                className="w-full"
                disabled={isPending}
                onClick={signInWithGithub}
              >
                <Image
                  src="/github.svg"
                  width={20}
                  height={20}
                  alt="github logo"
                />
                Continue with Github
              </Button>
              <Button
                variant={'outline'}
                type="button"
                className="w-full"
                disabled={isPending}
                onClick={signInWithGoogle}
              >
                <Image
                  src="/google.svg"
                  width={20}
                  height={20}
                  alt="google logo"
                />
                Continue with Google
              </Button>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-form-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="login-form-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="m@example.com"
                      autoComplete="on"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-form-password">
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="login-form-password"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      autoComplete="on"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field orientation="vertical">
                <Button type="submit" form="login-form" className="w-full">
                  Submit
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link
                    href={'/signup'}
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  )
}

export { LoginForm }
