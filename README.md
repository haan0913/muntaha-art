# Muntaha.art — Artist Portfolio MVP

A dark cinematic, editorial/studio-diary portfolio-first website for Muntaha.

## What this MVP includes

- Static, fast, dependency-free website.
- Editable content files in `content/`.
- Decap CMS-ready `/admin` configuration for future no-code editing.
- Portfolio gallery with artwork detail modal.
- Shop-ready catalog structure with dynamic variants.
- Originals set to inquiry-only.
- Print/card/digital/commission CTAs that can later point to Stripe Payment Links.
- Google Analytics placeholder.
- Deployment and maintenance docs.

## What this MVP intentionally does not include yet

- Live Stripe checkout.
- Live contact form backend.
- Shipping/tax automation.
- Real artist images, bio, CV, press, or email.

Those are blocked until the Stripe account, shipping rates, email address, and real assets are provided.

## Run locally

From this folder:

```powershell
python -m http.server 8788 --bind 127.0.0.1
```

Open: <http://127.0.0.1:8788>

## Main files

- `index.html` — site shell.
- `styles.css` — dark cinematic visual system.
- `script.js` — renders content from JSON.
- `content/site.json` — artist/site/contact/settings.
- `content/artworks.json` — portfolio and shop catalog data.
- `content/journal.json` — studio diary entries.
- `admin/config.yml` — future Decap CMS editor setup.
- `docs/` — educational setup/maintenance docs.

## Next build phases

1. Replace placeholder artwork and bio content.
2. Choose hosting and connect `muntaha.art`.
3. Configure `/admin` editing.
4. Create Stripe account and Payment Links.
5. Add production contact/newsletter tooling.
