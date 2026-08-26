import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyOps } from "./notify";

const ORIGINAL_ENV = process.env.OPS_WEBHOOK_URL;

describe("notifyOps()", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) {
      delete process.env.OPS_WEBHOOK_URL;
    } else {
      process.env.OPS_WEBHOOK_URL = ORIGINAL_ENV;
    }
  });

  it("không gọi fetch khi thiếu OPS_WEBHOOK_URL (tính năng tự tắt)", async () => {
    delete process.env.OPS_WEBHOOK_URL;
    const fetchSpy = vi.spyOn(global, "fetch");

    await notifyOps({ source: "seed", severity: "error", title: "Test" });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("KHÔNG throw dù thiếu cấu hình — không được phép làm crash pipeline gọi nó", async () => {
    delete process.env.OPS_WEBHOOK_URL;
    await expect(
      notifyOps({ source: "seed", severity: "error", title: "Test" })
    ).resolves.toBeUndefined();
  });

  it("POST đúng payload Discord-compatible khi có cấu hình", async () => {
    process.env.OPS_WEBHOOK_URL = "https://discord.example/webhook";
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await notifyOps({
      source: "mirror-images",
      severity: "warning",
      title: "5 ảnh mirror thất bại",
      detail: "chi tiết lỗi ở đây",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://discord.example/webhook");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.content).toContain("[LEIBO/mirror-images]");
    expect(body.content).toContain("5 ảnh mirror thất bại");
    expect(body.content).toContain("chi tiết lỗi ở đây");
  });

  it("KHÔNG throw khi webhook trả lỗi HTTP (fail-open)", async () => {
    process.env.OPS_WEBHOOK_URL = "https://discord.example/webhook";
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      notifyOps({ source: "seed", severity: "error", title: "Test" })
    ).resolves.toBeUndefined();
  });

  it("KHÔNG throw khi fetch tự nó reject (network lỗi, timeout...)", async () => {
    process.env.OPS_WEBHOOK_URL = "https://discord.example/webhook";
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));

    await expect(
      notifyOps({ source: "seed", severity: "error", title: "Test" })
    ).resolves.toBeUndefined();
  });

  it("cắt bớt nội dung quá dài thay vì gửi nguyên văn (giới hạn Discord 2000 ký tự)", async () => {
    process.env.OPS_WEBHOOK_URL = "https://discord.example/webhook";
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await notifyOps({
      source: "seed",
      severity: "error",
      title: "Test",
      detail: "x".repeat(5000),
    });

    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.content.length).toBeLessThanOrEqual(1990);
  });
});
