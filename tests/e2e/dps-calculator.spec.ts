import { test, expect } from "@playwright/test";

test.describe("DPS Calculator & KQM Benchmark", () => {
  test("should render the DPS calculator tool page", async ({ page }) => {
    await page.goto("/vi/tools/dps-calculator");
    
    // Page heading should be visible
    const heading = page.locator("h1, h2, h3").first();
    await expect(heading).toBeVisible();

    // Verify presence of DPS or showdown container
    const dpsContainer = page.locator("main");
    await expect(dpsContainer).toBeVisible();
  });
});
