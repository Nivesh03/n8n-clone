'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpgradeModal } from '@/hooks/use-upgrade-modal'
import { CredentialType } from '@/lib/generated/prisma/enums'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from '../hooks/use-credentials'

interface CredentialFormProps {
  initialData?: {
    id?: string
    name: string
    type: CredentialType
    value: string
  }
}

const formSchema = z.object({
  name: z.string().min(1, 'name is required'),
  type: z.enum(CredentialType),
  value: z.string().min(1, 'api key is required'),
})

export type FormValues = z.infer<typeof formSchema>

const credentialTypeOptions = [
  {
    value: CredentialType.GEMINI,
    label: 'Gemini',
    logo: '/logos/gemini.svg',
  },
  {
    value: CredentialType.OPENAI,
    label: 'OpenAI',
    logo: '/logos/openai.svg',
  },
  {
    value: CredentialType.ANTHROPIC,
    label: 'Anthropic',
    logo: '/logos/anthropic.svg',
  },
]

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const createCredential = useCreateCredential()
  const updateCredential = useUpdateCredential()
  const { handleError, modal } = useUpgradeModal()

  const isEdit = !!initialData?.id

  const form = useForm<FormValues>({
    defaultValues: initialData || {
      name: '',
      type: CredentialType.GEMINI,
      value: '',
    },
    resolver: zodResolver(formSchema),
  })
  const onSubmit = (values: FormValues) => {
    if (isEdit && initialData?.id) {
      updateCredential.mutateAsync({
        id: initialData.id,
        name: values.name,
        type: values.type,
        value: values.value,
      })
    } else {
      createCredential.mutateAsync(
        {
          name: values.name,
          type: values.type,
          value: values.value,
        },
        {
          onError: (error) => {
            handleError(error)
          },
          onSuccess: () => {},
        },
      )
    }
  }
  return (
    <>
      {modal}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Edit Credential' : 'Create Credential'}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? 'Update your API key or credentials'
              : 'Add a new API key or credentials for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action=""
            id="credential-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="vertical"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor="credential-form-name">
                      Secret Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="credential-form-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter a name for your secret"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="responsive"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="credential-form-type">
                        Type
                      </FieldLabel>
                      <FieldDescription>
                        Select the type of the secret key.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <Select
                      defaultValue={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="credential-form-type"
                        aria-invalid={fieldState.invalid}
                        className="min-w-[120px]"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Image
                              src={option.logo}
                              alt={option.label}
                              width={10}
                              height={10}
                            />
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                name="value"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="vertical"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor="credential-form-value">
                      Secret Value
                    </FieldLabel>
                    <Input
                      {...field}
                      id="credential-form-value"
                      aria-invalid={fieldState.invalid}
                      placeholder="sk_Lknseu10j3IN42..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal" className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              form="credential-form"
              disabled={
                createCredential.isPending || updateCredential.isPending
              }
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </>
  )
}

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credential } = useSuspenseCredential(credentialId)

  return <CredentialForm initialData={credential} />
}
