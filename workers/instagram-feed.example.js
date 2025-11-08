// workers/instagram-feed.example.js
// Example Cloudflare Worker that fetches your Instagram feed (Graph API or Basic Display) and returns
// a simplified JSON array [{src, alt, href}].
//
// IMPORTANT: You need a Business/Creator account linked to a Facebook Page to use the Graph API, OR use Basic Display API.
// Store secrets as environment variables in your Worker/Pages (e.g., IG_ACCESS_TOKEN).
//
// Deploy: wrangler deploy
// Then set your slider mount to data-json="https://<your-worker-subdomain>/instagram-feed"

export default {
  async fetch(request, env) {
    const token = env.IG_ACCESS_TOKEN; // store safely
    const userId = env.IG_USER_ID;     // your instagram business user id
    if (!token || !userId) {
      return new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } });
    }

    // Graph API example: recent media with media_url and permalink
    const url = `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,permalink,caption,thumbnail_url&access_token=${token}&limit=25`;

    try {
      const resp = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true } });
      if (!resp.ok) throw new Error('IG HTTP ' + resp.status);
      const data = await resp.json();
      const out = (data.data || [])
        .filter(x => x.media_type === 'IMAGE' || x.media_type === 'CAROUSEL_ALBUM' || x.media_type === 'VIDEO')
        .map(x => ({
          src: x.media_type === 'VIDEO' ? (x.thumbnail_url || x.media_url) : x.media_url,
          href: x.permalink,
          alt: (x.caption || '').slice(0, 120)
        }));
      return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } });
    } catch (e) {
      return new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } });
    }
  }
};
