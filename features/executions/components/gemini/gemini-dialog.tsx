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
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

export const AVAILABLE_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-lite-preview-06-17',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash-8b-latest',
] as const

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { error: 'Variable name is required' })
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
      message:
        'Variable name must start with a letter, underscore or dollar sign and can contain letters, numbers, underscores or dollar signs',
    }),
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, { error: 'User prompt is required' }),
})
export type GeminiFormType = z.infer<typeof formSchema>
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: z.infer<typeof formSchema>) => void
  defaultValues?: Partial<GeminiFormType>
}
export const GeminiDailog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: Props) => {
  const form = useForm<GeminiFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues?.variableName || '',
      model: defaultValues?.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues?.systemPrompt || '',
      userPrompt: defaultValues?.userPrompt || '',
    },
  })
  const handleSubmit = (values: GeminiFormType) => {
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues?.variableName || '',
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
          <DialogTitle>Gemini</DialogTitle>
          <DialogDescription>Configure the model and prompt.</DialogDescription>
        </DialogHeader>
        <form
          id="gemini-form"
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
                  <FieldLabel htmlFor="gemini-form-variable-name">
                    Variable Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="gemini-form-variable-name"
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
              name="model"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="google-form-model">Model</FieldLabel>
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
                      id="google-form-model"
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
                  <FieldLabel htmlFor="gemini-form-system-prompt">
                    System Prompt (Optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="gemini-form-system-prompt"
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
                  <FieldLabel htmlFor="gemini-form-user-prompt">
                    User Prompt
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="gemini-form-user-prompt"
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
            <Button type="submit" form="gemini-form">
              Save
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
