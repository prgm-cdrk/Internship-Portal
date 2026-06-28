// This API route creates a PayMongo checkout session for upgrading to BASIC or PRO plan
// It sends a request to PayMongo's API to create a payment link
// Then returns the checkout URL for the user to complete payment

import { PrismaClient } from '@prisma/client';    // Prisma client to query database
import { auth } from '@/lib/auth';                 // Auth function to get current session

// Create a Prisma client instance to interact with the database
const prisma = new PrismaClient();

// PayMongo API configuration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;  // Secret key from .env
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';      // PayMongo API base URL

// Handle POST requests to /api/payment/create-checkout
export async function POST(req: Request) {
  try {
    // Get the current session to identify the logged-in user
    const session = await auth();

    // Check if user is authenticated — reject if not logged in
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the plan from request body
    const { plan } = await req.json();

    // Validate that plan is provided and is either BASIC or PRO
    if (!plan || !['BASIC', 'PRO'].includes(plan)) {
      return Response.json(
        { error: 'Invalid plan. Only BASIC and PRO plan upgrades are available.' },
        { status: 400 }
      );
    }

    // Set pricing based on selected plan
    const planPricing: { [key: string]: { amount: number; name: string; description: string } } = {
      BASIC: { amount: 29900, name: 'BASIC Plan', description: 'Upgrade to BASIC plan for 10 postings and 10 applicants' },
      PRO: { amount: 49900, name: 'PRO Plan', description: 'Upgrade to PRO plan for unlimited features' }
    };

    const selectedPlan = planPricing[plan];

    // Find the company linked to the logged-in user
    const company = await prisma.company.findFirst({
      where: { userId: parseInt(session.user.id) }
    });

    // If no company found, user must have a company first
    if (!company) {
      return Response.json(
        { error: 'You must have a company first' },
        { status: 400 }
      );
    }

    // Check if PayMongo secret key is configured
    if (!PAYMONGO_SECRET_KEY) {
      return Response.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Create PayMongo checkout session via their API
    // Using Basic Auth with secret key as username and empty password
    const authHeader = 'Basic ' + Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64');

    const paymongoResponse = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        data: {
          attributes: {
            // Payment amount in centavos based on selected plan
            line_items: [
              {
                name: `${selectedPlan.name} - Monthly Subscription`,
                description: selectedPlan.description,
                quantity: 1,
                amount: selectedPlan.amount,  // Amount in centavos (₱29900 for BASIC, ₱49900 for PRO)
                currency: 'PHP'
              }
            ],
            // Payment method types accepted
            payment_method_types: ['gcash', 'paymaya', 'card'],
            // Success and cancel redirect URLs
            success_url: `${process.env.NEXTAUTH_URL}/dashboard/company/billing?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/company/billing?cancelled=true`,
            // Reference ID for tracking
            reference_number: `${plan}-${company.id}-${Date.now()}`,
            // Description for the payment
            description: `${selectedPlan.name} Subscription for ${company.name}`
          }
        }
      })
    });

    // Parse PayMongo response
    const paymongoData = await paymongoResponse.json();

    // If PayMongo returned an error, return it
    if (!paymongoResponse.ok) {
      console.error('PayMongo error:', paymongoData);
      return Response.json(
        { error: 'Failed to create payment session' },
        { status: 500 }
      );
    }

    // Extract checkout URL from PayMongo response
    const checkoutUrl = paymongoData.data?.attributes?.checkout_url;

    if (!checkoutUrl) {
      return Response.json(
        { error: 'Failed to get checkout URL' },
        { status: 500 }
      );
    }

    // Return the checkout URL for the frontend to redirect
    return Response.json({
      checkoutUrl,
      sessionId: paymongoData.data?.id
    }, { status: 200 });

  } catch (error) {
    // Log the error for debugging and return a generic error message
    console.error('Payment checkout error:', error);
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
