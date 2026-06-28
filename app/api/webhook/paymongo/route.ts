// This API route handles PayMongo webhook notifications
// When a payment is completed, PayMongo sends a POST request to this endpoint
// It verifies the payment and updates the company's subscription to PRO

import { PrismaClient } from '@prisma/client';    // Prisma client to query database

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// PayMongo webhook signing secret for verification
const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET;

// Handle POST requests to /api/webhook/paymongo
export async function POST(req: Request) {
  try {
    // Parse the webhook payload from PayMongo
    const body = await req.json();

    // Log the webhook event for debugging
    console.log('PayMongo webhook received:', body.data?.type);

    // Verify webhook signature if secret is configured
    // PayMongo sends a signature header for verification
    const signature = req.headers.get('paymongo-signature');

    // If webhook secret is configured, verify the signature
    if (PAYMONGO_WEBHOOK_SECRET && signature) {
      // TODO: Implement signature verification
      // PayMongo provides a way to verify webhook authenticity
      // For now, we'll process the webhook and log it
      console.log('Webhook signature present:', signature);
    }

    // Extract the event type from the webhook payload
    const eventType = body.data?.type;

    // Handle different event types
    switch (eventType) {
      // Payment successful - upgrade subscription to PRO
      case 'payment.paid':
        await handlePaymentPaid(body.data);
        break;

      // Payment failed - log the failure
      case 'payment.failed':
        console.log('Payment failed:', body.data);
        break;

      // Checkout session completed
      case 'checkout_session.completed':
        await handleCheckoutCompleted(body.data);
        break;

      // Unknown event type - just log it
      default:
        console.log('Unhandled webhook event:', eventType);
    }

    // Return 200 OK to acknowledge receipt
    return Response.json({ received: true }, { status: 200 });

  } catch (error) {
    // Log the error for debugging
    console.error('Webhook error:', error);
    // Return 200 to prevent PayMongo from retrying
    // We don't want retries for processing errors
    return Response.json({ received: true }, { status: 200 });
  }
}

// Handle payment.paid event - upgrade company to PRO
async function handlePaymentPaid(paymentData: any) {
  try {
    // Extract reference number from the payment
    const referenceNumber = paymentData.attributes?.reference_number;

    if (!referenceNumber) {
      console.log('No reference number in payment');
      return;
    }

    // Parse company ID from reference number (format: PRO-{companyId}-{timestamp})
    const parts = referenceNumber.split('-');
    const companyId = parseInt(parts[1]);

    if (isNaN(companyId)) {
      console.log('Invalid company ID in reference number');
      return;
    }

    // Calculate expiration date (1 month from now)
    const expiredAt = new Date();
    expiredAt.setMonth(expiredAt.getMonth() + 1);

    // Update or create subscription for this company
    await prisma.subscription.upsert({
      where: { companyId },
      update: {
        plan: 'PRO',
        status: 'ACTIVE',
        expiredAt
      },
      create: {
        companyId,
        plan: 'PRO',
        status: 'ACTIVE',
        expiredAt
      }
    });

    console.log(`Company ${companyId} upgraded to PRO plan`);

  } catch (error) {
    console.error('Error processing payment:', error);
  }
}

// Handle checkout_session.completed event
async function handleCheckoutCompleted(sessionData: any) {
  try {
    // Log the completed checkout for auditing
    console.log('Checkout completed:', sessionData.id);

    // Extract reference number if available
    const referenceNumber = sessionData.attributes?.reference_number;

    if (referenceNumber) {
      console.log('Reference:', referenceNumber);
    }

  } catch (error) {
    console.error('Error processing checkout completion:', error);
  }
}
