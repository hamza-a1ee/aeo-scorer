import 'server-only';

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import type { IAPIResponse } from '@/types/interfaces/api-response.interface';

import { HttpError } from './http-error';

export function ok<T>(data: T, message = 'OK', status = 200) {
  return NextResponse.json<IAPIResponse<T>>(
    { success: true, message, data },
    { status },
  );
}

export function fail(message: string, status = 400, errors?: string[]) {
  return NextResponse.json<IAPIResponse>(
    { success: false, message, errors },
    { status },
  );
}

type TRouteHandler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Wraps a route handler: zod → 400, HttpError → its status, else 500. */
export function handleRoute<C>(fn: TRouteHandler<C>): TRouteHandler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (error) {
      if (error instanceof ZodError) {
        return fail(
          error.issues[0]?.message ?? 'Invalid request',
          400,
          error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        );
      }
      if (error instanceof HttpError) {
        return fail(error.message, error.status, error.errors);
      }
      console.error('[api]', error);
      return fail(
        error instanceof Error ? error.message : 'Something went wrong',
        500,
      );
    }
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertUuid(id: string, what = 'Scan'): string {
  if (!UUID_RE.test(id)) throw new HttpError(404, `${what} not found`);
  return id;
}

export function parseIntParam(value: string, what = 'Item'): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(404, `${what} not found`);
  return n;
}
