/**
 * src/lib/notify.ts
 *
 * Gửi thông báo đến kênh Ops (Discord webhook) khi có sự kiện quan trọng:
 * - Pipeline thành công/thất bại
 * - Mirror ảnh lỗi
 * - Seed thất bại
 *
 * Tự tắt nếu thiếu OPS_WEBHOOK_URL (không throw, không crash).
 */

const MAX_CONTENT_LENGTH = 1900; // Discord giới hạn 2000 ký tự, để dư ra

export interface NotifyOptions {
  source: 'seed' | 'mirror-images' | 'crawl' | 'update-data' | 'verify';
  severity: 'info' | 'warning' | 'error';
  title: string;
  detail?: string;
}

/**
 * Gửi thông báo đến Discord webhook (nếu được cấu hình).
 * Fail-open: nếu webhook không có hoặc lỗi, chỉ log lỗi ra console, không throw.
 */
export async function notifyOps(options: NotifyOptions): Promise<void> {
  const webhookUrl = process.env.OPS_WEBHOOK_URL;
  if (!webhookUrl) {
    // Không log cảnh báo ở đây vì có thể chưa cấu hình là bình thường
    return;
  }

  const emoji = options.severity === 'error' ? '🚨' : options.severity === 'warning' ? '⚠️' : 'ℹ️';
  let content = `${emoji} **[LEIBO/${options.source}]** ${options.title}`;

  if (options.detail) {
    const detail = options.detail.slice(0, MAX_CONTENT_LENGTH - content.length - 10);
    content += `\n\`\`\`\n${detail}\n\`\`\``;
  }

  // Cắt nếu vẫn quá dài
  if (content.length > 2000) {
    content = content.slice(0, 1997) + '...';
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      console.error(`[notifyOps] Webhook responded with ${response.status}: ${await response.text()}`);
    }
  } catch (error) {
    // Fail-open: không throw, chỉ log
    console.error('[notifyOps] Failed to send notification:', error);
  }
}