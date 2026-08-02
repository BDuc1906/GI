/**
 * Neon free tier tự "ngủ" (suspend) compute khi không có hoạt động. Lúc build
 * (Next.js prerender `/sitemap.xml` và các route dùng `generateStaticParams`),
 * nếu compute vừa ngủ lại ngay sau bước migrate, lần kết nối đầu tiên qua
 * pooler đôi khi bị từ chối thẳng (ECONNREFUSED) thay vì đợi compute thức
 * dậy. Bọc query bằng retry ngắn để build không fail vì đúng khoảnh khắc đó.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  { retries = 3, delayMs = 1500 }: { retries?: number; delayMs?: number } = {}
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isConnRefused =
        err instanceof Error &&
        "code" in err &&
        (err as { code?: string }).code === "ECONNREFUSED";
      if (!isConnRefused || attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}