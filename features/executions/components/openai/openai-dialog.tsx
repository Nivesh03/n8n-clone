import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { useCredentialByType } from '@/features/credentials/hooks/use-credentials'
import { CredentialType } from '@/lib/generated/prisma/enums'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

export const AVAILABLE_MODELS = [
  'gpt-4.1-mini',
  'gpt-4.1',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-4.5-preview',
  'gpt-3.5-turbo',
  'chatgpt-4o-latest',
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-5-chat-latest',
  'o1',
  'o3-mini',
  'o3',
] as const

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { error: 'Variable name is required' })
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
      message:
        'Variable name must start with a letter, underscore or dollar sign and can contain letters, numbers, underscores or dollar signs',
    }),
  credentialId: z.string().min(1, 'Credential ID is required'),
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, { error: 'User prompt is required' }),
})
export type OpenAiFormType = z.infer<typeof formSchema>
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: z.infer<typeof formSchema>) => void
  defaultValues?: Partial<OpenAiFormType>
}
export const OpenAiDailog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: Props) => {
  const { data: credentials, isLoading: credentialsLoading } =
    useCredentialByType(CredentialType.OPENAI)

  const form = useForm<OpenAiFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues?.variableName || '',
      credentialId: defaultValues?.credentialId || '',
      model: defaultValues?.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues?.systemPrompt || '',
      userPrompt: defaultValues?.userPrompt || '',
    },
  })
  const handleSubmit = (values: OpenAiFormType) => {
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName || '',
        credentialId: defaultValues?.credentialId || '',
        model: defaultValues?.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues?.systemPrompt || '',
        userPrompt: defaultValues?.userPrompt || '',
      })
    }
  }, [open, defaultValues, form])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenAI</DialogTitle>
          <DialogDescription>Configure the model and prompt.</DialogDescription>
        </DialogHeader>
        <form
          id="openai-form"
          action=""
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8 mt-4"
        >
          <FieldGroup>
            <Controller
              name="variableName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="vertical" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="openai-form-variable-name">
                    Variable Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="openai-form-variable-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="users"
                  />
                  <FieldDescription>
                    Use this name to reference the response data in subsequent
                    nodes. Eg {'{{users.text}}'}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="credentialId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="openai-form-credential-id">
                      Credential
                    </FieldLabel>
                    <FieldDescription>
                      Select the name of the credential.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Select
                    disabled={credentialsLoading || credentials?.length === 0}
                    defaultValue={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="openai-form-credential-id"
                      aria-invalid={fieldState.invalid}
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Select a credential" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {credentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <Image
                            src="/logos/openai.svg"
                            alt="openai"
                            width={16}
                            height={16}
                          />
                          {credential.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="model"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="openai-form-model">Model</FieldLabel>
                    <FieldDescription>
                      Select the model for the request.
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
                      id="openai-form-model"
                      aria-invalid={fieldState.invalid}
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="systemPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="vertical" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="openai-form-system-prompt">
                    System Prompt (Optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="openai-form-system-prompt"
                    aria-invalid={fieldState.invalid}
                    placeholder="You are a helpful assistant."
                    className="min-h-[120px] font-mono text-sm"
                  />
                  <FieldDescription>
                    Sets the behavior of the assistant.This prompt is used to
                    guide the agent&apos;s behavior and response.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="userPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="vertical" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="openai-form-user-prompt">
                    User Prompt
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="openai-form-user-prompt"
                    aria-invalid={fieldState.invalid}
                    placeholder="Summarize the following text.{{json httpResponse.text}}"
                    className="min-h-[120px] font-mono text-sm"
                  />
                  <FieldDescription>
                    The prompt sent to the agent. This is the question or
                    statement that the agent will respond to.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Field orientation="horizontal" className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" form="openai-form">
              Save
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
