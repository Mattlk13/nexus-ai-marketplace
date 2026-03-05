import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, orders, stripeAccounts, stripeProducts, contentItems, products } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { notifyOwner } from "./_core/notification";

// ─── Stripe client ────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// ─── Platform commission rate (15%) ──────────────────────────────────────────
const PLATFORM_FEE_PERCENT = 0.15;

// ─── Create Stripe Connect account for vendor ─────────────────────────────────
export async function createConnectAccount(userId: number, email: string, origin: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  // Check if already has an account
  const existing = await db.select().from(stripeAccounts).where(eq(stripeAccounts.userId, userId)).limit(1);
  if (existing.length > 0 && existing[0].stripeAccountId) {
    // Return onboarding link for existing account
    const accountLink = await stripe.accountLinks.create({
      account: existing[0].stripeAccountId,
      refresh_url: `${origin}/vendor?stripe=refresh`,
      return_url: `${origin}/vendor?stripe=success`,
      type: "account_onboarding",
    });
    return { url: accountLink.url, accountId: existing[0].stripeAccountId, isNew: false };
  }

  // Create new Express account
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    metadata: { userId: userId.toString() },
  });

  // Save to DB
  await db.insert(stripeAccounts).values({
    userId,
    stripeAccountId: account.id,
    accountStatus: "pending",
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
  });

  // Update user record
  await db.update(users).set({ stripeAccountId: account.id }).where(eq(users.id, userId));

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${origin}/vendor?stripe=refresh`,
    return_url: `${origin}/vendor?stripe=success`,
    type: "account_onboarding",
  });

  await notifyOwner({
    title: "New Vendor Stripe Connect",
    content: `User ID ${userId} started Stripe Connect onboarding. Account: ${account.id}`,
  });

  return { url: accountLink.url, accountId: account.id, isNew: true };
}

// ─── Get Connect account status ───────────────────────────────────────────────
export async function getConnectAccountStatus(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select().from(stripeAccounts).where(eq(stripeAccounts.userId, userId)).limit(1);
  if (rows.length === 0) return null;

  const row = rows[0];
  try {
    const account = await stripe.accounts.retrieve(row.stripeAccountId);
    // Sync status
    await db.update(stripeAccounts).set({
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      accountStatus: account.charges_enabled ? "active" : "pending",
    }).where(eq(stripeAccounts.userId, userId));

    return {
      accountId: row.stripeAccountId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      status: account.charges_enabled ? "active" : "pending",
      totalEarned: row.totalEarned,
      totalPaidOut: row.totalPaidOut,
    };
  } catch {
    return {
      accountId: row.stripeAccountId,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      status: "pending",
      totalEarned: row.totalEarned,
      totalPaidOut: row.totalPaidOut,
    };
  }
}

// ─── Create checkout session for content purchase ─────────────────────────────
export async function createContentCheckout(
  contentItemId: number,
  buyerEmail: string,
  buyerId: number,
  origin: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const items = await db.select().from(contentItems).where(eq(contentItems.id, contentItemId)).limit(1);
  if (items.length === 0) throw new Error("Content item not found");
  const item = items[0];

  const priceInCents = Math.round(parseFloat(item.price ?? "0") * 100);
  if (priceInCents < 50) throw new Error("Minimum purchase amount is $0.50");

  const platformFee = Math.round(priceInCents * PLATFORM_FEE_PERCENT);

  // Get vendor's Stripe account for transfer
  const vendorAccounts = await db.select().from(stripeAccounts).where(eq(stripeAccounts.userId, item.userId)).limit(1);
  const vendorStripeId = vendorAccounts.length > 0 ? vendorAccounts[0].stripeAccountId : null;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          description: item.description ?? undefined,
          images: item.thumbnailUrl ? [item.thumbnailUrl] : [],
        },
        unit_amount: priceInCents,
      },
      quantity: 1,
    }],
    mode: "payment",
    customer_email: buyerEmail,
    client_reference_id: buyerId.toString(),
    metadata: {
      user_id: buyerId.toString(),
      customer_email: buyerEmail,
      content_item_id: contentItemId.toString(),
      order_type: "content",
    },
    success_url: `${origin}/feed?purchase=success&item=${contentItemId}`,
    cancel_url: `${origin}/studio?purchase=cancelled`,
    allow_promotion_codes: true,
  };

  // Add platform fee split if vendor has Connect account
  if (vendorStripeId) {
    sessionParams.payment_intent_data = {
      application_fee_amount: platformFee,
      transfer_data: { destination: vendorStripeId },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  // Create pending order record
  await db.insert(orders).values({
    buyerId,
    sellerId: item.userId,
    contentItemId,
    orderType: "content",
    amount: item.price ?? "0.00",
    platformFee: (platformFee / 100).toFixed(2),
    vendorPayout: ((priceInCents - platformFee) / 100).toFixed(2),
    status: "pending",
    stripePaymentId: session.id,
  });

  return { url: session.url!, sessionId: session.id };
}

// ─── Create checkout session for product purchase ─────────────────────────────
export async function createProductCheckout(
  productId: number,
  buyerEmail: string,
  buyerId: number,
  origin: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const rows = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (rows.length === 0) throw new Error("Product not found");
  const product = rows[0];

  const priceInCents = Math.round(parseFloat(product.price) * 100);
  if (priceInCents < 50) throw new Error("Minimum purchase amount is $0.50");

  const platformFee = Math.round(priceInCents * PLATFORM_FEE_PERCENT);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: product.title,
          description: product.description ?? undefined,
          images: product.imageUrl ? [product.imageUrl] : [],
        },
        unit_amount: priceInCents,
      },
      quantity: 1,
    }],
    mode: "payment",
    customer_email: buyerEmail,
    client_reference_id: buyerId.toString(),
    metadata: {
      user_id: buyerId.toString(),
      customer_email: buyerEmail,
      product_id: productId.toString(),
      order_type: "product",
    },
    success_url: `${origin}/marketplace?purchase=success&product=${productId}`,
    cancel_url: `${origin}/marketplace?purchase=cancelled`,
    allow_promotion_codes: true,
  });

  // Create pending order
  await db.insert(orders).values({
    buyerId,
    productId,
    orderType: "product",
    amount: product.price,
    platformFee: (platformFee / 100).toFixed(2),
    vendorPayout: ((priceInCents - platformFee) / 100).toFixed(2),
    status: "pending",
    stripePaymentId: session.id,
  });

  return { url: session.url!, sessionId: session.id };
}

// ─── Handle Stripe webhook events ─────────────────────────────────────────────
export async function handleWebhookEvent(rawBody: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return { verified: true };
  }

  const db = await getDb();
  if (!db) return { received: true };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      // Mark order as paid
      await db.update(orders)
        .set({ status: "paid" })
        .where(eq(orders.stripePaymentId, sessionId));

      // Notify owner
      await notifyOwner({
        title: "💰 New Sale on NEXUS!",
        content: `Order paid: ${session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : "unknown"} — Customer: ${session.customer_email ?? "unknown"}`,
      });
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const rows = await db.select().from(stripeAccounts)
        .where(eq(stripeAccounts.stripeAccountId, account.id)).limit(1);

      if (rows.length > 0) {
        await db.update(stripeAccounts).set({
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
          accountStatus: account.charges_enabled ? "active" : "pending",
        }).where(eq(stripeAccounts.stripeAccountId, account.id));
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(`[Webhook] Payment failed: ${pi.id}`);
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  return { received: true };
}

export { stripe };
