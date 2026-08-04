import { S3Client } from "@aws-sdk/client-s3";

/**
 * scripts/lib/r2-client.ts
 *
 * Cloudflare R2 tương thích API S3 — dùng thẳng @aws-sdk/client-s3 chính
 * thức của AWS với `endpoint` trỏ về R2, KHÔNG cần SDK riêng của
 * Cloudflare. Đây là cách được chính Cloudflare khuyến nghị và là pattern
 * phổ biến nhất hiện nay (2026) để tích hợp R2 vào app Node.js/Next.js.
 *
 * `region: "auto"` là bắt buộc với R2 (R2 tự định tuyến theo edge gần
 * nhất, không có khái niệm "AWS region" thật như S3).
 *
 * R2 bucket KHÔNG public theo mặc định — phải gắn "Custom domain" trong
 * Cloudflare Dashboard (Bucket → Settings → Public access) rồi trỏ
 * R2_PUBLIC_URL vào domain đó, script này không tự làm được bước đó (thao
 * tác 1 lần trên dashboard, không có API tương đương đáng tin cậy để tự
 * động hoá an toàn).
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Thiếu biến môi trường "${name}" — cần để chạy scripts/mirror-images-to-r2.ts.\n` +
        `Xem .env.example, mục "Object storage (Cloudflare R2)" để biết cách lấy giá trị.`
    );
  }
  return value;
}

let cachedClient: S3Client | null = null;

export function createR2Client(): S3Client {
  if (cachedClient) return cachedClient;
  const accountId = requireEnv("R2_ACCOUNT_ID");
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  return cachedClient;
}

export function r2BucketName(): string {
  return requireEnv("R2_BUCKET_NAME");
}

/** Ghép key object thành URL public thật (qua custom domain), vd "characters/kazuha/icon.png" -> "https://assets.example.com/characters/kazuha/icon.png". */
export function r2PublicUrl(key: string): string {
  const base = requireEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
  return `${base}/${key}`;
}

/** True nếu `url` đã trỏ vào chính R2_PUBLIC_URL — dùng để bỏ qua các dòng đã mirror từ lần chạy trước (script idempotent, chạy lại nhiều lần vẫn an toàn). */
export function isAlreadyMirrored(url: string): boolean {
  const base = process.env.R2_PUBLIC_URL;
  return !!base && url.startsWith(base.replace(/\/+$/, "") + "/");
}
