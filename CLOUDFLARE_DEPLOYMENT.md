# Cloudflare Pages deployment

This site is a static portfolio. Use Cloudflare Pages with the generated `dist/`
folder as the deploy artifact.

## Recommended settings

If connecting this folder through Git:

- Framework preset: **None**
- Root directory: `projects/muntaha-art` if Cloudflare is pointed at the
  larger `AI_STATION` repository; otherwise leave blank if this folder is the
  repository root.
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: none required

If using Direct Upload:

```powershell
cd C:\AI_STATION\projects\muntaha-art
npm run build
```

Then upload the `dist` folder in the Cloudflare Pages dashboard, or deploy it
with Wrangler:

```powershell
npx wrangler pages deploy dist --project-name=muntaha-art
```

## What goes live

The build copies only launch files into `dist`:

- `index.html`, `styles.css`, `script.js`
- `content/`
- live artwork files referenced by the portfolio
- `robots.txt`, `sitemap.xml`
- Cloudflare Pages `_headers` and `_redirects`
- `404.html`

It intentionally excludes local preview folders, screenshots, logs, source
research files, old Netlify config, documentation, Canva source exports, and
removed artwork assets.

## Domain

After the Pages project is deployed, add `muntaha.art` as a custom domain in
Cloudflare Pages. If Cloudflare is also handling DNS, add the domain to
Cloudflare and update the Spaceship nameservers to the two Cloudflare
nameservers shown in the dashboard.
