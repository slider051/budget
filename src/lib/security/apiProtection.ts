import { NextResponse, type NextRequest } from "next/server";

interface RateLimitRule {
  readonly bucket: "api" | "cron";
  readonly windowMs: number;
  readonly max: number;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

declare global {
  var __apiRateLimitStore: Map<string, RateLimitState> | undefined;
  var __apiRateLimitLastGcAt: number | undefined;
}

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_API_MAX = 60;
const DEFAULT_CRON_MAX = 10;
const GC_INTERVAL_MS = 5 * 60_000;
const STALE_ENTRY_TTL_MS = 10 * 60_000;

const suspiciousPathPatterns = [
  /\/\.env(?:\.|$)/i,
  /\/\.git(?:\/|$)/i,
  /wp-admin/i,
  /wp-login/i,
  /xmlrpc\.php/i,
  /phpmyadmin/i,
  /\.php(?:\/|$)/i,
  /cgi-bin/i,
  /\.\./,
  /%2e%2e/i,
  /%2f%2e/i,
  /%5c/i,
];

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const API_RATE_LIMIT_WINDOW_MS = parsePositiveInt(
  process.env.API_RATE_LIMIT_WINDOW_MS,
  DEFAULT_WINDOW_MS,
);
const API_RATE_LIMIT_MAX = parsePositiveInt(
  process.env.API_RATE_LIMIT_MAX,
  DEFAULT_API_MAX,
);
const CRON_RATE_LIMIT_MAX = parsePositiveInt(
  process.env.CRON_RATE_LIMIT_MAX,
  DEFAULT_CRON_MAX,
);

function getStore(): Map<string, RateLimitState> {
  if (!globalThis.__apiRateLimitStore) {
    globalThis.__apiRateLimitStore = new Map<string, RateLimitState>();
  }
  return globalThis.__apiRateLimitStore;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "unknown";
}

function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isSuspiciousApiPath(pathname: string): boolean {
  const decoded = safeDecode(pathname);
  return suspiciousPathPatterns.some(
    (pattern) => pattern.test(pathname) || pattern.test(decoded),
  );
}

function getRateLimitRule(pathname: string): RateLimitRule {
  if (pathname === "/api/cron" || pathname.startsWith("/api/cron/")) {
    return {
      bucket: "cron",
      windowMs: API_RATE_LIMIT_WINDOW_MS,
      max: CRON_RATE_LIMIT_MAX,
    };
  }

  return {
    bucket: "api",
    windowMs: API_RATE_LIMIT_WINDOW_MS,
    max: API_RATE_LIMIT_MAX,
  };
}

function runGarbageCollection(store: Map<string, RateLimitState>, now: number) {
  const lastGc = globalThis.__apiRateLimitLastGcAt ?? 0;
  if (now - lastGc < GC_INTERVAL_MS) return;

  for (const [key, state] of store.entries()) {
    if (state.resetAt + STALE_ENTRY_TTL_MS < now) {
      store.delete(key);
    }
  }

  globalThis.__apiRateLimitLastGcAt = now;
}

function withRateLimit(
  request: NextRequest,
  rule: RateLimitRule,
): NextResponse | null {
  const store = getStore();
  const now = Date.now();
  runGarbageCollection(store, now);

  const ip = getClientIp(request);
  const rateLimitKey = `${rule.bucket}:${ip}`;
  const existing = store.get(rateLimitKey);

  if (!existing || existing.resetAt <= now) {
    store.set(rateLimitKey, {
      count: 1,
      resetAt: now + rule.windowMs,
    });
    return null;
  }

  existing.count += 1;
  store.set(rateLimitKey, existing);

  if (existing.count <= rule.max) {
    return null;
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000),
  );

  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export function protectApiRequest(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  if (!isApiPath(pathname)) return null;

  if (request.method === "OPTIONS") return null;

  if (isSuspiciousApiPath(pathname)) {
    return NextResponse.json(
      { error: "Not Found" },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const rule = getRateLimitRule(pathname);
  return withRateLimit(request, rule);
}
