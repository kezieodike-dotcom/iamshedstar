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

`npm run dev` runs `dev-server.ts`, which mounts Vite in front of the API from
`server.ts`. Opening Vite's own port directly (5173) gives you a front end with
no API behind it, and every data-driven section will be empty.

Vite is imported only by `dev-server.ts`, never by `server.ts`. That separation
is load-bearing: `server.ts` is bundled into the Vercel function, and bundlers
follow even a lazy `await import('vite')` in an unreachable branch, pulling in
esbuild's `require.resolve('esbuild')` and lightningcss's native `.node`
bindings — which then fail at load and crash the function on every request.

## Deploying

**This app needs a Node server and a writable disk. A static host will not
work.** Deploying only the `vite build` output leaves `/api/*` returning 404,
and because each section is gated on its data, the home page renders with
Music, Videos, Merch and Tour silently missing.

### Vercel (current host)

`vercel.json` + `api/[...path].ts` run the Express app as a serverless
function, so `/api/*` is answered and every section renders. `server.ts`
exports the app and skips `app.listen()` when `VERCEL` is set; the catch-all
filename means requests arrive with their original path, so no rewrites are
needed.

#### Making data survive — connect a Blob store

Vercel's filesystem is read-only apart from `/tmp`, which is wiped on every
cold start. Without durable storage the site displays fine but **loses every
booking inquiry, contact message, newsletter signup and order**, and admin
edits revert.

Fix it once, in the dashboard — no code or env editing:

1. Vercel project → **Storage** → **Create Database** → **Blob**.
2. Connect it to this project. Vercel injects `BLOB_READ_WRITE_TOKEN`
   automatically.
3. Redeploy.

The server picks the token up on its own: the database is read from the blob
once per cold start and written back after any change. `getDb()`/`saveDb()`
stay synchronous, so no route handler changed — the async work lives in
`ensureLoaded()` and `flushPendingWrite()`, which `api/[...path].ts` awaits
either side of each request. That flush matters: without it the function can
freeze the moment a response is sent, killing an in-flight save.

Note this is last-write-wins across concurrent instances. Fine for a site of
this shape; wrong for anything with contended writes.

Check it worked:

| `/api/health` says | Meaning |
| --- | --- |
| `"storage": "blob"` | Connected and durable. This is what you want. |
| `"storage": "blob-unreachable"` | Token present but the store can't be read or written — content still serves from defaults, but **nothing is saved**. |
| `"storage": "ephemeral"` | No store connected; running on `/tmp`. Nothing is saved. |

The Render blueprint below is the alternative if you would rather have a plain
mounted disk.

### Render (persistent)

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

| `storage`          | Meaning                                                        |
| ------------------ | -------------------------------------------------------------- |
| `blob`             | Vercel Blob store connected. Submissions are saved.              |
| `disk`             | A real mounted volume. Submissions are saved.                    |
| `blob-unreachable` | Token set but the store errors. **Nothing is saved.**            |
| `ephemeral`        | Writable but wiped on restart (Vercel `/tmp`). Nothing is saved. |
| `memory`           | Data dir unwritable; serving built-in defaults. Nothing is saved.|

A **404** from this endpoint means no backend is deployed at all — the symptom
that makes every data-driven section vanish from the page.
