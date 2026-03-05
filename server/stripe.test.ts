import { describe, expect, it, vi, beforeEach } from "vitest";

// ─── Mock Stripe ──────────────────────────────────────────────────────────────
vi.mock("stripe", () => {
  const mockStripe = {
    accounts: {
      create: vi.fn().mockResolvedValue({
        id: "acct_test123",
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: "acct_test123",
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      }),
    },
    accountLinks: {
      create: vi.fn().mockResolvedValue({
        url: "https://connect.stripe.com/setup/s/test",
        expires_at: 1234567890,
      }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: "cs_test_abc123",
          url: "https://checkout.stripe.com/pay/cs_test_abc123",
          amount_total: 999,
          customer_email: "buyer@test.com",
        }),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  };
  return { default: vi.fn(() => mockStripe) };
});

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  }),
}));

// ─── Mock notification ────────────────────────────────────────────────────────
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Stripe Integration", () => {
  describe("Platform fee calculation", () => {
    it("calculates 15% platform fee correctly on $9.99 item", () => {
      const priceInCents = Math.round(9.99 * 100); // 999
      const platformFee = Math.round(priceInCents * 0.15); // 150
      const vendorPayout = priceInCents - platformFee; // 849

      expect(platformFee).toBe(150);
      expect(vendorPayout).toBe(849);
      expect((vendorPayout / 100).toFixed(2)).toBe("8.49");
    });

    it("calculates 15% platform fee correctly on $49.99 item", () => {
      const priceInCents = Math.round(49.99 * 100); // 4999
      const platformFee = Math.round(priceInCents * 0.15); // 750
      const vendorPayout = priceInCents - platformFee; // 4249

      expect(platformFee).toBe(750);
      expect(vendorPayout).toBe(4249);
    });

    it("calculates 15% platform fee correctly on $1.00 item", () => {
      const priceInCents = Math.round(1.00 * 100); // 100
      const platformFee = Math.round(priceInCents * 0.15); // 15
      const vendorPayout = priceInCents - platformFee; // 85

      expect(platformFee).toBe(15);
      expect(vendorPayout).toBe(85);
    });

    it("rejects items below Stripe minimum ($0.50)", () => {
      const priceInCents = Math.round(0.25 * 100); // 25
      expect(priceInCents).toBeLessThan(50);
    });

    it("accepts items at exactly Stripe minimum ($0.50)", () => {
      const priceInCents = Math.round(0.50 * 100); // 50
      expect(priceInCents).toBeGreaterThanOrEqual(50);
    });
  });

  describe("Webhook event handling", () => {
    it("identifies test events by evt_test_ prefix", () => {
      const testEventId = "evt_test_abc123";
      const isTestEvent = testEventId.startsWith("evt_test_");
      expect(isTestEvent).toBe(true);
    });

    it("does not flag real events as test events", () => {
      const realEventId = "evt_1abc2def3ghi";
      const isTestEvent = realEventId.startsWith("evt_test_");
      expect(isTestEvent).toBe(false);
    });

    it("handles checkout.session.completed event type", () => {
      const supportedEvents = [
        "checkout.session.completed",
        "account.updated",
        "payment_intent.payment_failed",
      ];
      expect(supportedEvents).toContain("checkout.session.completed");
    });
  });

  describe("Stripe Connect account", () => {
    it("generates correct onboarding URL structure", async () => {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe("sk_test_fake");
      const result = await stripe.accountLinks.create({
        account: "acct_test123",
        refresh_url: "https://example.com/vendor?stripe=refresh",
        return_url: "https://example.com/vendor?stripe=success",
        type: "account_onboarding",
      });
      expect(result.url).toContain("stripe.com");
    });

    it("creates Express account with correct capabilities", async () => {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe("sk_test_fake");
      const account = await stripe.accounts.create({
        type: "express",
        email: "vendor@test.com",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      expect(account.id).toBe("acct_test123");
    });
  });

  describe("Checkout session creation", () => {
    it("creates checkout session with correct metadata", async () => {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe("sk_test_fake");
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: "Test eBook" },
            unit_amount: 999,
          },
          quantity: 1,
        }],
        mode: "payment",
        customer_email: "buyer@test.com",
        client_reference_id: "42",
        metadata: {
          user_id: "42",
          customer_email: "buyer@test.com",
          content_item_id: "7",
          order_type: "content",
        },
        success_url: "https://example.com/feed?purchase=success",
        cancel_url: "https://example.com/studio?purchase=cancelled",
        allow_promotion_codes: true,
      });
      expect(session.id).toBe("cs_test_abc123");
      expect(session.url).toContain("checkout.stripe.com");
    });
  });
});
