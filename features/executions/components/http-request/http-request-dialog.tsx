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

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: 'Variable name is required' })
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, {
      message:
        'Variable name must start with a letter, underscore or dollar sign and can contain letters, numbers, underscores or dollar signs',
    }),
  endpoint: z.url({ message: 'Invalid URL' }),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  body: z.string().optional(),
})
export type HTTPFormType = z.infer<typeof formSchema>
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: z.infer<typeof formSchema>) => void
  defaultValues?: Partial<HTTPFormType>
}
export const HttpRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: Props) => {
  const form = useForm<HTTPFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues?.variableName || '',
      body: defaultValues?.body || '',
      endpoint: defaultValues?.endpoint || '',
      method: defaultValues?.method || 'GET',
    },
  })
  const watchMethod = form.watch('method')
  const showBodyField = ['POST', 'PUT', 'PATCH'].includes(watchMethod)
  const handleSubmit = (values: HTTPFormType) => {
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        body: defaultValues?.body || '',
        endpoint: defaultValues?.endpoint || '',
        method: defaultValues?.method || 'GET',
        variableName: defaultValues?.variableName || '',
      })
    }
  }, [open, defaultValues, form])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Http request</DialogTitle>
          <DialogDescription>
            Configure the http request settings.
          </DialogDescription>
        </DialogHeader>
        <form
          id="http-form"
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
                  <FieldLabel htmlFor="http-form-variable-name">
                    Variable Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="http-form-variable-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="users"
                  />
                  <FieldDescription>
                    Use this name to reference the response data in subsequent
                    nodes. Eg {'{{users.httpResponse.data}}'}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="method"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="http-form-method">Method</FieldLabel>
                    <FieldDescription>
                      Select the http method for the request.
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
                      id="http-form-method"
                      aria-invalid={fieldState.invalid}
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="endpoint"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="vertical" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="http-form-endpoint">Endpoint</FieldLabel>
                  <Input
                    {...field}
                    id="http-form-endpoint"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                  />
                  <FieldDescription>
                    Enter a static URL. For dynamic URLs use {'{{variable}}'}.
                    Use {'{{json variable}}'} to stringify objects.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {showBodyField && (
              <Controller
                name="body"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="vertical"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor="http-form-body">
                      Request Body
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="http-form-body"
                      aria-invalid={fieldState.invalid}
                      placeholder={
                        '{\n "userId": "{{httpResponse.data.id}}",\n "name":   "{{httpResponse.data.name}}"\n}'
                      }
                      className="min-h-[120px] font-mono text-sm"
                    />
                    <FieldDescription>
                      JSON with template variables. Use {'{{variable}}'} for
                      simple values. Use {'{{json variable}}'} to stringify
                      objects.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
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
            <Button type="submit" form="http-form">
              Save
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
