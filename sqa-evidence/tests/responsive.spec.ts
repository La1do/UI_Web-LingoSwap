import { expect, test } from "@playwright/test";

test.describe("Responsive UI smoke", () => {
  test("login page renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("login page renders on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
