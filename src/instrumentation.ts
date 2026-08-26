import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // BUG NEXT.JS 16.3.0 (không phải lỗi của app): kể từ 16.3.0, nội bộ
    // Next tự gắn 6 listener "close" lên MỖI `ServerResponse` (tăng từ 5 ở
    // Next 15 — do tạo 2 AbortController: 1 cho request, 1 riêng cho
    // middleware). Dự án này dùng `next-intl` middleware (src/proxy.ts) +
    // Sentry APM (2 listener nữa qua instrumentation này) — đúng tổ hợp mà
    // Next.js team xác nhận đẩy tổng listener lên 11, vượt ngưỡng mặc định
    // 10 của Node, gây warning
    // "MaxListenersExceededWarning: ... close listeners added to
    // [ServerResponse]" tràn ngập log dev — dù KHÔNG có leak thật (mỗi
    // ServerResponse là 1 lần, không tích luỹ qua nhiều request; xác nhận
    // tại https://github.com/vercel/next.js/discussions/96973).
    //
    // Node cảnh báo chỉ vì NGÂN SÁCH mặc định (10) quá thấp so với những gì
    // framework + APM hợp lệ đã cần (11) — không phải vì có gì sai. Nâng
    // ngân sách mặc định lên đây, đúng 1 lần khi server khởi động, thay vì
    // nhét NODE_OPTIONS vào script `dev`/`start` (phụ thuộc shell, dễ quên
    // khi đổi máy/CI/deploy). Cách này áp dụng nhất quán mọi môi trường
    // (dev, next start, deploy serverless) vì instrumentation.ts luôn chạy
    // trước mọi request bất kể chạy ở đâu.
    const events = await import("node:events");
    events.default.defaultMaxListeners = 20;

    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
