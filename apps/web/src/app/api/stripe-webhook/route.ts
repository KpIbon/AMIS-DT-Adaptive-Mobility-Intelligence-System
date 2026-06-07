// Stripe webhook placeholder.
// Real implementation: verify signature with stripe.webhooks.constructEvent,
// handle checkout.session.completed, invoice.paid, customer.subscription.updated,
// provision access in the users table, and write to audit_log.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;

  if (!sig || !secret || !key) {
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 400 });
  }

  const body = await req.text();
  try {
    const stripe = new Stripe(key);
    const event = stripe.webhooks.constructEvent(body, sig, secret);
    switch (event.type) {
      case "checkout.session.completed":
        // TODO: provision the user, mark them as paying in the users table.
        break;
      case "customer.subscription.updated":
        // TODO: refresh their plan status.
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[/api/stripe-webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
