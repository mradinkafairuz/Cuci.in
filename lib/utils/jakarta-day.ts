export function getJakartaDayBounds(date = new Date()) {
  const jakarta = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const start = new Date(Date.UTC(jakarta.getUTCFullYear(), jakarta.getUTCMonth(), jakarta.getUTCDate()) - 7 * 60 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
