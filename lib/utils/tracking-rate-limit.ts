const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 20;

type RateLimitWindow = {
  count: number;
  resetAt: number;
};

const attemptsByClient = new Map<string, RateLimitWindow>();

function getClientKey(request: Request): string {
  const trustedIp =
    request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return trustedIp || "unknown";
}

export function checkTrackingRateLimit(request: Request): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const clientKey = getClientKey(request);
  let window = attemptsByClient.get(clientKey);

  if (!window || window.resetAt <= now) {
    if (attemptsByClient.size >= 5000) {
      for (const [key, value] of attemptsByClient) {
        if (value.resetAt <= now) attemptsByClient.delete(key);
      }
      if (attemptsByClient.size >= 5000) {
        const oldestKey = attemptsByClient.keys().next().value;
        if (oldestKey) attemptsByClient.delete(oldestKey);
      }
    }
    window = { count: 0, resetAt: now + WINDOW_MS };
    attemptsByClient.set(clientKey, window);
  }

  if (window.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
    };
  }

  window.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
