/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Local development entry point: the API from server.ts with Vite mounted in
 * front of it, so the app and its backend are served together on one port.
 *
 * This is a separate entry precisely so that server.ts never references Vite.
 * server.ts is bundled into the Vercel serverless function, and bundlers follow
 * even a lazy `await import('vite')` inside an unreachable branch — pulling in
 * esbuild's require.resolve('esbuild') and lightningcss's native bindings,
 * which then fail at load time and crash the function on every request.
 */

import { createServer as createViteServer } from 'vite';
import app, { listen } from './server';

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

app.use(vite.middlewares);
listen();
