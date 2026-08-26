// src/lib/sync/DataSyncPipeline.ts
/**
 * DataSyncPipeline — trigger đồng bộ dữ liệu từ genshin-db.
 *
 * PHIÊN BẢN TRƯỚC (đã sửa) gọi thẳng `npm run db:full` — script này ghi
 * TRỰC TIẾP vào DATABASE_URL (production nếu đó là Neon thật), KHÔNG
 * qua bất kỳ bước kiểm tra nào. Trong khi đó dự án đã tự thiết kế sẵn
 * 1 quy trình an toàn hơn cho đúng việc này —
 * `.github/workflows/update-data.yml`: crawl → seed vào DB TEST tạm →
 * `db:verify` kiểm tra tính toàn vẹn → CHỈ khi qua mới tạo Pull Request
 * để người duyệt merge; verify fail thì tạo issue cảnh báo, không đụng
 * gì tới production. Để AI Agent gọi thẳng `db:full` là đi tắt qua
 * đúng lớp an toàn đó — dữ liệu crawl sai (genshin-db lỗi, API đổi
 * field...) sẽ ghi thẳng vào DB thật không ai kịp soát trước.
 *
 * Vì vậy bản này KHÔNG chạy `db:full`, mà TRIGGER lại đúng workflow
 * GitHub Actions đã có (`workflow_dispatch`) qua GitHub REST API —
 * đúng cùng 1 quy trình an toàn dùng cho lịch chạy tự động hàng tuần,
 * chỉ khác là chạy ngay theo yêu cầu thay vì chờ thứ 4 hàng tuần.
 * AI Agent không bao giờ tự ghi thẳng vào production DB qua đường này.
 *
 * Yêu cầu cấu hình: GITHUB_TOKEN (PAT hoặc fine-grained token, quyền
 * "Actions: Read and write" trên đúng repo), GITHUB_REPO_OWNER,
 * GITHUB_REPO_NAME. Không cấu hình → sync() trả lỗi rõ ràng thay vì
 * fallback về hành vi cũ nguy hiểm.
 */

import { prisma } from "@/lib/db/prisma";

const WORKFLOW_FILE = "update-data.yml";
const GITHUB_API = "https://api.github.com";

export interface SyncResult {
  success: boolean;
  pipelineRunId: string;
  dispatched: boolean;
  workflowRunUrl?: string;
  message: string;
}

export class DataSyncPipeline {
  /**
   * Trigger workflow `update-data.yml` qua GitHub API. Đây là hành
   * động BẤT ĐỒNG BỘ theo bản chất (workflow_dispatch không trả kết
   * quả chạy xong, chỉ xác nhận đã xếp hàng) — sync() vì vậy KHÔNG chờ
   * tới khi crawl/seed/PR xong, chỉ xác nhận đã trigger thành công và
   * cố gắng tìm link theo dõi. Muốn biết kết quả cuối (PR được tạo hay
   * issue cảnh báo), xem tab Actions/Pull requests trên GitHub — đúng
   * quy trình review vốn đã được thiết kế cho việc này.
   *
   * @param force  Chưa dùng để đổi hành vi dispatch (workflow không
   *   nhận input `force` nào) — giữ tham số để không phải đổi chữ ký
   *   API nếu sau này thêm `workflow_dispatch.inputs.force` vào yml.
   */
  async sync(force: boolean = false): Promise<SyncResult> {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;

    const run = await prisma.pipelineRun.create({
      data: { name: "agent-sync", status: "started", details: { force, trigger: "ai_agent" } },
    });

    if (!token || !owner || !repo) {
      await prisma.pipelineRun.update({
        where: { id: run.id },
        data: {
          status: "failed",
          endedAt: new Date(),
          error: "Thiếu GITHUB_TOKEN/GITHUB_REPO_OWNER/GITHUB_REPO_NAME — xem ENV-ADDITIONS.md",
        },
      });
      return {
        success: false,
        pipelineRunId: run.id,
        dispatched: false,
        message: "Chưa cấu hình đủ biến môi trường để trigger GitHub Actions (GITHUB_TOKEN/GITHUB_REPO_OWNER/GITHUB_REPO_NAME).",
      };
    }

    const startedAt = Date.now();
    try {
      const dispatchRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref: process.env.GITHUB_DEFAULT_BRANCH || "main" }),
        }
      );

      if (!dispatchRes.ok) {
        const body = await dispatchRes.text().catch(() => "");
        throw new Error(`GitHub API trả về ${dispatchRes.status}: ${body.slice(0, 500)}`);
      }

      // Best-effort tìm link run vừa dispatch — GitHub cần vài giây để
      // run xuất hiện trong danh sách, nên đây chỉ là tiện ích thêm,
      // KHÔNG phải điều kiện để coi dispatch là thành công (dispatch
      // 204 ở trên mới là thành công thật).
      const workflowRunUrl = await this.tryFindLatestRunUrl(owner, repo, token);

      await prisma.pipelineRun.update({
        where: { id: run.id },
        data: {
          status: "success",
          endedAt: new Date(),
          durationMs: Date.now() - startedAt,
          details: { force, trigger: "ai_agent", note: "Đã trigger update-data.yml, chưa chờ chạy xong", workflowRunUrl },
        },
      });

      return {
        success: true,
        pipelineRunId: run.id,
        dispatched: true,
        workflowRunUrl,
        message:
          "Đã trigger workflow update-data.yml. Pipeline chạy trên DB test riêng, verify tính toàn vẹn, " +
          "rồi tạo Pull Request cho bạn review — KHÔNG tự ghi thẳng vào production. Theo dõi tiến độ ở tab Actions" +
          (workflowRunUrl ? `: ${workflowRunUrl}` : "."),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await prisma.pipelineRun.update({
        where: { id: run.id },
        data: { status: "failed", endedAt: new Date(), durationMs: Date.now() - startedAt, error: message.slice(0, 4000) },
      });
      return { success: false, pipelineRunId: run.id, dispatched: false, message };
    }
  }

  private async tryFindLatestRunUrl(owner: string, repo: string, token: string): Promise<string | undefined> {
    try {
      await new Promise((r) => setTimeout(r, 2000)); // cho GitHub vài giây để đăng ký run mới
      const res = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/actions/workflows/${WORKFLOW_FILE}/runs?event=workflow_dispatch&per_page=1`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) return undefined;
      const json = await res.json();
      return json?.workflow_runs?.[0]?.html_url;
    } catch {
      return undefined; // best-effort — không tìm được link không nghĩa là dispatch thất bại
    }
  }
}

