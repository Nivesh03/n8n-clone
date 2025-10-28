'use client'

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
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
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import Image from 'next/image'

const registerSchema = z
  .object({
    email: z.email({ error: 'Please enter a valid email address' }),
    password: z.string().min(1, { error: 'Password is required' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
type RegisterSchema = z.infer<typeof registerSchema>
const RegisterForm = () => {
  const router = useRouter()
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const onSubmit = async (data: RegisterSchema) => {
    await authClient.signUp.email({
      email: data.email,
      name: data.email,
      password: data.password,
      callbackURL: '/',
    }, {
      onSuccess: () => {
        router.push("/")
      }, onError : (err) => {
        toast.error(err.error.message)
      }
    })
  }
  const isPending = form.formState.isSubmitting
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col justify-center items-center">
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Button
                variant={'outline'}
                type="button"
                className="w-full"
                disabled={isPending}
              >
                <Image src="/github.svg" width={20} height={20} alt='github logo' />
                Continue with Github
              </Button>
              <Button
                variant={'outline'}
                type="button"
                className="w-full"
                disabled={isPending}
              >
                <Image src="/google.svg" width={20} height={20} alt='google logo' />
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
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-form-confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="login-form-confirm-password"
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
                  Already have an account?{' '}
                  <Link
                    href={'/login'}
                    className="underline underline-offset-4"
                  >
                    Login
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

export { RegisterForm }
