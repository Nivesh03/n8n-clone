import { sendWorkflowExecution } from '@/inngest/utils'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const workflowId = url.searchParams.get('workflowId')
    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is missing' },
        { status: 400 },
      )
    }
    const body = await request.json()
    const formData = {
      formId: body.formId,
      title: body.title,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    }
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        googleForm: formData,
      },
    })
    return NextResponse.json({ status: 200 })
  } catch (error) {
    console.error('google form webhook error', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
