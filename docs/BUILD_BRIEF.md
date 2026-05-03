# Build Brief — Muntaha.art MVP

## Product goal

Create a portfolio-first artist website for Muntaha that can grow into a shop.

## Current scope

- Dark cinematic, editorial/studio-diary feel.
- Balance fine-art credibility with personal warmth.
- 7–10 launch pieces with placeholder data for now.
- Originals are inquiry-only.
- Prints, cards/stickers, digital downloads, and commissions are represented in the catalog but not live checkout yet.
- Shipping: continental United States only at launch.
- Taxes: handled manually for MVP.
- Google Analytics: placeholder until measurement ID is available.

## Chosen MVP architecture

Static site + JSON content + Decap CMS-ready admin.

Why:

- No backend required for the first version.
- Fast, cheap hosting options.
- Easy to inspect and repair.
- The artist can eventually update content through `/admin` after hosting/Git auth is configured.
- Stripe can be added listing-by-listing through Payment Links without rebuilding a full ecommerce backend.

## Deferred decisions

- Real contact email.
- Real artwork images and approved descriptions.
- Hosting provider and domain DNS setup.
- Stripe account and product/payment links.
- Shipping rates and packaging policy.
- Newsletter platform.
