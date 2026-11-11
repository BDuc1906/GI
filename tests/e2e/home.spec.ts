import { test, expect } from "@playwright/test";

test.describe("Homepage & Navigation", () => {
  test("should load the home page with correct title and elements", async ({ page }) => {
    await page.goto("/vi");
    
    // Check title
    await expect(page).toHaveTitle(/LEIBO/);

    // Verify main header/nav is present
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Verify characters link exists
    const charactersLink = page.locator('a[href*="/characters"]').first();
    await expect(charactersLink).toBeVisible();
  });

  test("should open search command palette when clicked", async ({ page }) => {
    await page.goto("/vi");
    
    // Look for search button or keyboard shortcut trigger
    const searchButton = page.locator('button[aria-label*="search" i], button:has-text("Tìm kiếm")').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      const searchDialog = page.locator('[role="dialog"], [data-command-palette]');
      await expect(searchDialog).toBeVisible();
    }
  });
});
