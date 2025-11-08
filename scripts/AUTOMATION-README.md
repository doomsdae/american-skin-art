# Automating the Instagram Feed JSON

You have two good options to keep `data/instagram-feed.json` fresh for the home slider.

---

## Option A — GitHub Action (recommended)

**What it does:** Every morning at ~08:05 America/New_York, it fetches a JSON feed from a URL you control (e.g., a Cloudflare Worker) and commits the file to the repo.

### Steps
1. Deploy the sample Worker (or any endpoint) that returns your feed as a JSON array:
   ```json
   [
     {"src":"https://.../image1.jpg","href":"https://instagram.com/p/....","alt":"caption"},
     ...
   ]
   ```

2. In GitHub → **Settings → Secrets and variables → Actions**, add:
   - `WORKER_JSON_URL` = `https://<your-worker-subdomain>/instagram-feed`

3. Ensure this repo contains `.github/workflows/update-instagram-feed.yml` (already included).

4. Trigger a manual run in **Actions** (Workflow Dispatch) or wait for the daily schedule.

**Result:** `data/instagram-feed.json` is updated in `main` automatically. Your slider will use it via:
```html
<div id="recent-showcase" data-json="/data/instagram-feed.json"></div>
```

---

## Option B — Cloudflare Worker Cron (serve fresh JSON)

If you prefer not to commit JSON to your repo, serve the feed directly from a Worker on a schedule (e.g., cache into KV). The site will point its slider at the Worker URL.

### Files included
- `workers/instagram-feed.example.js` — Worker code that fetches IG Graph API and emits a simplified JSON.
- `workers/wrangler.example.toml` — shows how to set up a cron schedule and KV bindings.

### Steps (outline)
1. `wrangler init` and copy the example files.
2. Set secrets:
   ```bash
   wrangler secret put IG_ACCESS_TOKEN
   wrangler secret put IG_USER_ID
   ```
3. Deploy:
   ```bash
   wrangler deploy
   ```
4. In `index.html`, set the slider to your Worker URL:
   ```html
   <div id="recent-showcase" data-json="https://<your-worker-subdomain>/instagram-feed"></div>
   ```

---

### JSON contract

Each item should include:
- `src` (string): direct image URL
- `href` (string, optional): permalink to the post (opens in new tab)
- `alt` (string, optional): short caption (<= 120 chars recommended)

The slider limits to ~18 items and shuffles when falling back to inline data.
