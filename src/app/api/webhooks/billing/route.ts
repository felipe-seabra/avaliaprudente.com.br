import { NextResponse } from 'next/server'
import { BillingService } from '@/core/application/services/billing-service'

// Placeholder for webhook secret verification.
// In a real implementation (e.g., Stripe), this uses the raw request body and the Stripe SDK.
// const WEBHOOK_SECRET = process.env.BILLING_WEBHOOK_SECRET

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-billing-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Trust boundary: The signature MUST be verified before processing the event.
    // if (!verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
    //   throw new Error('Invalid signature')
    // }

    // For the placeholder, we just parse the JSON
    const event = JSON.parse(rawBody)
    const eventType = event.type || 'unknown'

    // Pass to the isolated billing service
    const billingService = new BillingService()
    await billingService.handleWebhookEvent(eventType, event)

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error(`[Billing Webhook] Error:`, error)
    // Always return 400 for webhook errors to avoid leaking implementation details
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}
