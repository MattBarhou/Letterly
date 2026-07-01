import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripePriceId } from "@/lib/plans";
import { getAppUrl, getStripe } from "@/lib/stripe";

function getCheckoutErrorMessage(error) {
  if (error?.type === "StripeInvalidRequestError") {
    if (error.code === "resource_missing") {
      return "This plan is not available. Check that your Stripe price IDs match your API key mode (test vs live).";
    }
    return error.message;
  }

  return "Could not start checkout. Please try again.";
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to subscribe." },
        { status: 401 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { planId, billing, priceId: legacyPriceId } = body;

    let priceId = legacyPriceId;

    if (planId && billing) {
      priceId = getStripePriceId(planId, billing);
    }

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Subscription prices are not configured. Add STRIPE_PRICE_* env vars and redeploy.",
        },
        { status: 500 },
      );
    }

    const user = await currentUser();
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancel`,
      client_reference_id: userId,
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
      ...(user?.emailAddresses?.[0]?.emailAddress
        ? { customer_email: user.emailAddresses[0].emailAddress }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: getCheckoutErrorMessage(error) },
      { status: 500 },
    );
  }
}
