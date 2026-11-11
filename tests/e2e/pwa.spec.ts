import { test, expect } from "@playwright/test";

test.describe("PWA Infrastructure", () => {
  test("should serve manifest.webmanifest with valid PWA fields", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBeTruthy();
    
    const manifest = await res.json();
    expect(manifest.name).toContain("LEIBO");
    expect(manifest.short_name).toBe("LEIBO");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  test("should serve service worker sw.js", async ({ request }) => {
    const res = await request.get("/sw.js");
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain("leibo-pwa-v1");
    expect(text).toContain("addEventListener");
  });

  test("should serve PWA icons", async ({ request }) => {
    const icon192 = await request.get("/icons/icon-192.png");
    expect(icon192.ok()).toBeTruthy();
    expect(icon192.headers()["content-type"]).toContain("image/png");

    const icon512 = await request.get("/icons/icon-512.png");
    expect(icon512.ok()).toBeTruthy();
    expect(icon512.headers()["content-type"]).toContain("image/png");
  });
});
