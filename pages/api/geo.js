// Runs at the edge, next to the visitor, where Vercel resolves their location.
export const config = { runtime: 'edge' };

/**
 * The visitor's country code (ISO 3166-1, e.g. "CA"), from Vercel's IP
 * geolocation, for the cookieless analytics in utils/analytics.js. Nothing
 * else about the visitor is returned or kept. `country` is null off Vercel.
 */
export default function Geo(req) {
    const country = req.headers.get('x-vercel-ip-country') || null;
    return new Response(JSON.stringify({ country }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
}
