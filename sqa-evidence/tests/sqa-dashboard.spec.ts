import { expect, test } from "@playwright/test";
test.describe("SQA evidence dashboard", () => {
  test("renders full FE01-FE124 checklist summary", async ({ page }) => {
    await page.goto("/sqa-evidence/index.html");

    await expect(page.getByText("LingoSwap SQA Test Evidence Dashboard")).toBeVisible();
    await expect(page.locator(".card").filter({ hasText: "Total FE Cases" })).toContainText("124");
    await expect(page.locator(".card").filter({ hasText: "Passed" })).toContainText("124");
    await expect(page.getByRole("cell", { name: "FE01", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "FE124", exact: true })).toBeVisible();
  });
});
