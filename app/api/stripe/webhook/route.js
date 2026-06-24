import { NextResponse } from "next/server";
import { getTierFromPriceId } from "@/lib/plans";
import {
  getUserIdFromCustomer,
  setSubscription,
} from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";

export async function POST(request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.client_reference_id;
        if (!userId) break;

        const subscriptionId = session.subscription;
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0]?.price?.id;
        const tier = getTierFromPriceId(priceId) || "starter";

        await setSubscription(userId, {
          tier,
          status: sub.status,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: subscriptionId,
          priceId,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId =
          sub.metadata?.userId || (await getUserIdFromCustomer(sub.customer));

        if (!userId) break;

        const priceId = sub.items.data[0]?.price?.id;
        const tier = getTierFromPriceId(priceId) || "starter";
        const isActive = sub.status === "active" || sub.status === "trialing";

        await setSubscription(userId, {
          tier: isActive ? tier : "free",
          status: isActive ? "active" : sub.status,
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: sub.id,
          priceId,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId =
          sub.metadata?.userId || (await getUserIdFromCustomer(sub.customer));

        if (!userId) break;

        await setSubscription(userId, {
          tier: "free",
          status: "canceled",
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: null,
          priceId: null,
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
