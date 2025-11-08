# American Skin Art — Static Site (asa-v1)

This is a production-ready folder layout for hosting on Cloudflare Pages (or any static host).  
**Important:** Replace `index.sample.html` with your finalized `index.html` before deploying.

## Structure
- `assets/` — All static assets (CSS, JS, images, fonts)
- `artists/` — Optional per-artist pages
- `data/` — JSON data (e.g., artists, shop hours)
- `_headers`, `_redirects` — Optional host config (cache, redirects)
- `robots.txt`, `sitemap.xml` — SEO helpers
- `404.html` — Custom not-found page

## Build/Deploy
No build step required. Connect the repo to Cloudflare Pages. Output directory = root (`/`).

## Versioning
Update asset URLs with a version query string (e.g., `?v=asa-v1`) when you ship updates.
