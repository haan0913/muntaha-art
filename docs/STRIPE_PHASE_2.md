# Stripe Phase 2 Plan

## MVP payment recommendation

Start with **Stripe Payment Links** per sellable variant.

Why:

- Muntaha can create products/prices in Stripe Dashboard.
- Each website variant can store one `paymentLink`.
- The site can show "Buy with Stripe" automatically when a link exists.
- Originals remain protected as inquiry-only.

## Stripe setup checklist

1. Create Stripe account.
2. Add business/payout details.
3. Create products for print/card/digital items.
4. Create prices/Payment Links for each variant.
5. Configure shipping collection for continental US.
6. Decide refund/return policy.
7. Turn on email receipts.
8. Paste each Payment Link into `content/artworks.json`.

## When to use full Stripe Checkout instead

Use a custom Checkout integration later if you need:

- Cart with multiple items.
- Inventory reservation.
- Automated fulfillment database.
- Discount codes with custom logic.
- Shipping-rate logic beyond simple Payment Links.
- Webhook-driven order management.

## Original art rule

Do not use Payment Links for one-of-one originals in phase 2. Keep them as email inquiry so availability, condition, pickup/shipping, and collector relationship can be handled manually.
