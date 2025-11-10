import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}
export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams()
  const workflowId = params.workflowId as string
  const baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:3000'
  const webhookUrl = `https://${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard')
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Stripe webhook settings to trigger this
            workflow when a payment event is created
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open stripe dashboard</li>
              <li>Go to developers {'->'} Webhooks</li>
              <li>Click {'"Add endpoint"'}</li>
              <li>Paste the webhook URL shown above</li>
              <li>
                Select events to listen for (eg. payment_intent.succeeded)
              </li>
              <li>Save and copy the signing secret</li>
            </ol>
          </div>
          <div className="rounded-lg p-4 space-y-2 bg-muted">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {'{{stripe.amount}}'}
                </code>
                - Payment amount
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {'{{stripe.currency}}'}
                </code>
                - Payment currency
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {'{{stripe.eventType}}'}
                </code>
                - Payment event type (eg. payment_intent.succeeded)
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
