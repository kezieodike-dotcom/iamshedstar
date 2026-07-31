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
 *
 * The app is imported lazily inside the handler so that a failure while loading
 * it becomes a readable JSON response instead of an opaque
 * FUNCTION_INVOCATION_FAILED with the stack buried in the platform's logs.
 *
 * The '../server.js' specifier must keep its extension. Vercel transpiles this
 * file rather than bundling it and runs it as ESM (package.json sets
 * "type": "module"), and Node's ESM resolver does not add extensions — an
 * extensionless '../server' is not resolvable, so Vercel's file tracer never
 * includes server.ts in the deployment and the import fails at runtime with
 * ERR_MODULE_NOT_FOUND. TypeScript maps the .js specifier back to server.ts.
 */

import type { IncomingMessage, ServerResponse } from 'http';

type ExpressLike = (req: IncomingMessage, res: ServerResponse) => void;

let cached: ExpressLike | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!cached) {
      const mod = await import('../server.js');
      cached = (mod.default ?? mod) as unknown as ExpressLike;
    }
    return cached(req, res);
  } catch (error: any) {
    // Full stack to the platform log; only a short message to the caller, so a
    // failure is still diagnosable from a request without publishing internals.
    console.error('[api] failed to load the Express app:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'API failed to start',
        message: String(error?.message ?? error)
      })
    );
  }
}
