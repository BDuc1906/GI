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

/**
 * Endpoint API riêng tư của R2 — dạng "https://<accountId>.r2.cloudflarestorage.com".
 * Endpoint này BẮT BUỘC chữ ký AWS SigV4 để truy cập (dùng cho S3Client ở
 * dưới), trình duyệt gọi thẳng URL dạng này LUÔN nhận 403 Forbidden vì
 * request không có chữ ký.
 *
 * ĐÃ CÓ SỰ CỐ THẬT: R2_PUBLIC_URL từng bị set nhầm thành chính endpoint
 * này (thay vì Custom Domain public), khiến toàn bộ ảnh đã mirror sang R2
 * (phần lớn ảnh của site) không tải được trên trình duyệt, dù object vẫn
 * tồn tại trong bucket (nên các script cũ dùng HeadObjectCommand có ký để
 * kiểm tra vẫn báo "ok" — không phát hiện được lỗi này). Chặn cứng ngay
 * tại nguồn (hàm dựng URL) để lỗi này không thể lặp lại và tái xuất hiện
 * âm thầm.
 */
const PRIVATE_R2_ENDPOINT_PATTERN = /^[a-f0-9]{32}\.r2\.cloudflarestorage\.com$/i;

/**
 * Cũng chặn domain public MẶC ĐỊNH dạng "<bucket>.<accountId>.r2.dev" —
 * URL này CÓ THể truy cập public (nếu bật "Allow Access" trong dashboard),
 * nhưng Cloudflare khuyến cáo không dùng cho production (không có SLA, dễ
 * bị rate-limit) và scripts/lib/r2-client.ts::r2PublicUrl() ở dưới được
 * thiết kế cho Custom Domain ổn định lâu dài. Nếu bạn CHỦ ĐỘNG muốn dùng
 * r2.dev tạm thời, sửa trực tiếp dòng return bên dưới — không khuyến khích
 * cho production lâu dài.
 */
function assertIsPublicUrl(rawUrl: string): void {
  let hostname: string;
  try {
    hostname = new URL(rawUrl).hostname;
  } catch {
    throw new Error(
      `Biến môi trường "R2_PUBLIC_URL"="${rawUrl}" không phải URL hợp lệ.\n` +
        `Ví dụ đúng: https://assets.leibo-domain-cua-ban.com (KHÔNG có dấu / cuối).`
    );
  }

  if (PRIVATE_R2_ENDPOINT_PATTERN.test(hostname)) {
    throw new Error(
      `❌ R2_PUBLIC_URL="${rawUrl}" đang trỏ vào ENDPOINT API RIÊNG TƯ của R2 ` +
        `("<accountId>.r2.cloudflarestorage.com"), KHÔNG PHẢI domain public.\n\n` +
        `Endpoint này bắt buộc chữ ký AWS SigV4 — trình duyệt gọi thẳng URL này sẽ ` +
        `LUÔN nhận 403 Forbidden. Đây chính xác là nguyên nhân toàn bộ ảnh trên site ` +
        `không hiển thị được (dù object vẫn tồn tại trong bucket).\n\n` +
        `👉 Cách sửa đúng (làm 1 lần trên Cloudflare Dashboard):\n` +
        `   1. Vào dash.cloudflare.com → R2 → chọn bucket của bạn\n` +
        `   2. Settings → Public access → "Connect Domain" (Custom Domain)\n` +
        `   3. Trỏ 1 subdomain (vd assets.leibo-domain-cua-ban.com) vào bucket\n` +
        `   4. Đổi R2_PUBLIC_URL trong .env / biến môi trường Vercel thành domain đó\n` +
        `   5. Chạy "npm run images:fix-public-url -- --apply" để vá lại các URL đã lưu sai trong DB\n` +
        `   6. Chạy lại "npm run images:mirror" cho các ảnh mirror sau này\n\n` +
        `Xem thêm .env.example, mục "Object storage (Cloudflare R2)".`
    );
  }
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
  const raw = requireEnv("R2_PUBLIC_URL");
  assertIsPublicUrl(raw);
  const base = raw.replace(/\/+$/, "");
  return `${base}/${key}`;
}

/** True nếu `url` đã trỏ vào chính R2_PUBLIC_URL — dùng để bỏ qua các dòng đã mirror từ lần chạy trước (script idempotent, chạy lại nhiều lần vẫn an toàn). */
export function isAlreadyMirrored(url: string): boolean {
  const base = process.env.R2_PUBLIC_URL;
  return !!base && url.startsWith(base.replace(/\/+$/, "") + "/");
}

/**
 * True nếu `url` trỏ vào endpoint API riêng tư của R2 (private, luôn 403
 * với trình duyệt) — dùng bởi scripts/fix-broken-r2-urls.ts và
 * scripts/check-r2-objects.ts để phát hiện các bản ghi DB bị lưu sai do
 * sự cố R2_PUBLIC_URL nói trên.
 */
export function isPrivateR2Endpoint(url: string): boolean {
  try {
    return PRIVATE_R2_ENDPOINT_PATTERN.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Tách "key" (đường dẫn object trong bucket, vd "characters/kazuha/icon.png")
 * ra khỏi 1 URL private endpoint dạng
 * "https://<accountId>.r2.cloudflarestorage.com/<bucketName>/<key>".
 * Trả về null nếu url không đúng định dạng này hoặc không khớp tên bucket.
 */
export function extractKeyFromPrivateR2Url(url: string, bucketName: string): string | null {
  if (!isPrivateR2Endpoint(url)) return null;
  const parsed = new URL(url);
  const prefix = `/${bucketName}/`;
  if (!parsed.pathname.startsWith(prefix)) return null;
  return parsed.pathname.slice(prefix.length);
}
