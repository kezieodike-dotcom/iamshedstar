<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Shedstar — Official Website

React + Vite front end and an Express API in one Node process. Content
(songs, videos, merch, tours, e-books, bookings, contacts, orders) lives in a
JSON file at `data/db.json`, managed through the in-app admin dashboard.

View in AI Studio: https://ai.studio/apps/ceca87cd-c847-4eeb-88f9-cf4fab55dc60

## Run locally

**Prerequisites:** Node.js

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your Stripe **test** keys.
   Until then the checkout endpoints return a clear "Stripe not configured"
   error instead of charging anyone.
3. `npm run dev` — serves the app and the API together on http://localhost:3000

`npm run dev` runs `server.ts`, which mounts Vite as middleware. Opening Vite's
own port directly (5173) gives you a front end with no API behind it, and every
data-driven section will be empty.

## Deploying

**This app needs a Node server and a writable disk. A static host will not
work.** Deploying only the `vite build` output leaves `/api/*` returning 404,
and because each section is gated on its data, the home page renders with
Music, Videos, Merch and Tour silently missing.

`render.yaml` in this repo describes a working deployment:

- Build `npm ci --include=dev && npm run build`, start `npm run start`.
  `--include=dev` matters — the build needs `esbuild` and `typescript`, which
  npm skips when `NODE_ENV=production`.
- `vite build` emits the client to `dist/`; the server bundle goes to
  `dist-server/`, kept separate so the server code isn't served as a static
  asset.
- A **persistent disk** is mounted and `DATA_DIR` points at it. Without a real
  volume the filesystem is ephemeral and every booking, contact message,
  subscriber and order is lost on restart. Render requires a paid instance for
  disks; the free plan has none.
- Set `APP_URL` to the live origin, or Stripe sends customers back to
  `localhost` after checkout.

To deploy: push to `main`, then on Render choose **New → Blueprint** and point
it at this repo. Fill in the secrets marked `sync: false`.

### Checking a deployment

```
curl https://<your-host>/api/health
```

```json
{ "ok": true, "storage": "disk", "persistent": true }
```

`"storage": "memory"` means the data directory isn't writable — the site still
serves the built-in default content, but **nothing visitors submit is saved**.
A 404 from this endpoint means no backend is deployed at all.
