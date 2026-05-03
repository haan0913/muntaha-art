# Cloudflare deployment

This site is a static portfolio. Cloudflare's current recommended flow for new
static sites is Workers Static Assets. The build creates a clean `dist/` folder,
and `wrangler.toml` tells Cloudflare to serve that folder as static assets.

## Recommended settings

If connecting this repository through the Cloudflare dashboard:

- Project name: `muntaha-art`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler versions upload`
- Path/root directory: `/`
- Environment variables: none required

If using Direct Upload:

```powershell
cd C:\AI_STATION\projects\muntaha-art
npm run build
```

Then upload the `dist` folder in the Cloudflare Pages dashboard, or deploy it
with Wrangler as a Worker static-assets project:

```powershell
npx wrangler deploy
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

After the project is deployed, add `muntaha.art` as a custom domain. If
Cloudflare is also handling DNS, add the domain to Cloudflare and update the
Spaceship nameservers to the two Cloudflare nameservers shown in the dashboard.
