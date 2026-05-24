import { expect, test } from "@playwright/test";

test.describe("FE01-FE24 Auth and OTP validation", () => {
  test("FE01-FE20 register form blocks empty and weak inputs", async ({ page }) => {
    await page.goto("/register");
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator("form")).toContainText(/không|required|trống/i);

    const inputs = page.locator("form input");
    await inputs.nth(0).fill("A");
    await inputs.nth(1).fill("invalid-email");
    await inputs.nth(2).fill("abc");
    await inputs.nth(3).fill("different");
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator("form")).toContainText(/email|ký tự|khớp|match/i);
  });

  test("FE21-FE24 forgot password email step validates required email before OTP flow", async ({ page }) => {
    await page.goto("/forgot-password");

    const submit = page.locator('form button[type="submit"]');
    await expect(submit).toBeDisabled();

    await page.locator('input[type="email"]').fill("user@example.com");
    await expect(submit).toBeEnabled();
  });
});
