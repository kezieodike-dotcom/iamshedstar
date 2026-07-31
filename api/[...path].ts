/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vercel serverless entry point for the API.
 *
 * A catch-all filename means every /api/* request routes here with its original
 * path intact, so the Express routes in server.ts (which are all registered
 * under /api) match without any rewrite rules.
 *
 * server.ts skips app.listen() when VERCEL is set — Vercel owns the HTTP layer
 * and just invokes this handler.
 */

import app from '../server';

export default app;
