export async function adminRequest<T>(token: string, url: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const result = await response.json() as { error?: string } & T;
  if (!response.ok) throw new Error(result.error ?? "Permintaan gagal.");
  return result;
}
