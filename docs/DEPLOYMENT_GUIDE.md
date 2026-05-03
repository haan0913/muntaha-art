# Deployment Guide

## Recommended beginner-friendly hosting path

Use Netlify for the first version because this project is static and already includes `netlify.toml` plus Decap CMS config.

High-level steps:

1. Create a GitHub repository for this folder.
2. Push the files to GitHub.
3. Create a Netlify site from that repository.
4. Set the publish directory to the project root.
5. In Spaceship DNS for `muntaha.art`, point the domain to Netlify using Netlify's domain instructions.
6. Enable Netlify Identity + Git Gateway if you want `/admin` editing.

## Admin note

The content files use object-shaped JSON such as `{ "items": [...] }` because that is easier for CMS editors than a raw top-level array.

## Alternative hosting

- **Cloudflare Pages**: very fast and cheap, but admin auth setup differs.
- **Vercel**: easy static hosting, but Decap/Git Gateway setup is less direct than Netlify.
- **Spaceship static hosting**: possible if available, but verify form/admin support first.
