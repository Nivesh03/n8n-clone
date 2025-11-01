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
  endpoint: z.url({ message: 'Invalid URL' }),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  body: z.string().optional(),
})
export type HTTPFormType = z.infer<typeof formSchema>
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: z.infer<typeof formSchema>) => void
  defaultEndpoint?: string
  defaultMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  defaultBody?: string
}
export const HttpRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultBody,
  defaultEndpoint,
  defaultMethod,
}: Props) => {
  const form = useForm<HTTPFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      body: defaultBody || '',
      endpoint: defaultEndpoint || '',
      method: defaultMethod || 'GET',
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
        body: defaultBody || '',
        endpoint: defaultEndpoint || '',
        method: defaultMethod || 'GET',
      })
    }
  }, [open, defaultBody, defaultEndpoint, defaultMethod, form])
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
