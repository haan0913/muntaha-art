# Maintenance Guide

## Plain-language mental model

The website has three layers:

1. **Design files** — `index.html`, `styles.css`, `script.js`.
2. **Content files** — `content/site.json`, `content/artworks.json`, `content/journal.json`.
3. **Future admin screen** — `/admin`, powered by Decap CMS after hosting is configured.

Most normal updates should happen in `content/`, not in the design files.

## Add or edit artwork manually

Open `content/artworks.json` and edit an artwork object inside the top-level `items` list.

Important fields:

- `title` — artwork title.
- `medium` — example: Oil on canvas.
- `dimensions` — example: 18 × 24 in.
- `image` — path to image file.
- `alt` — short image description for accessibility.
- `availabilityLabel` — example: Original by inquiry.
- `products` — print/card/digital/commission options.
- `paymentLink` — leave blank until Stripe is ready.

## Original artwork rule

Originals should stay inquiry-only. Do not add instant checkout links for one-of-one originals unless Muntaha explicitly changes the policy.

## Product variants

Each product can have many variants:

```json
{
  "size": "12 × 15 in",
  "material": "archival matte paper",
  "price": 65,
  "paymentLink": ""
}
```

When Stripe is ready, paste the Stripe Payment Link into `paymentLink`.

## Before publishing an update

Check:

- The artwork image loads.
- The title, medium, and dimensions are correct.
- Prices are accurate.
- Original works still say inquiry-only.
- The contact email is correct.
