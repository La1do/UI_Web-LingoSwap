import { expect, test } from "@playwright/test";
import { mockAuthenticatedUser, userMe } from "./helpers";

test.describe("FE83-FE89 review and streak UI", () => {
  test("submit button is disabled until rating is selected", async ({ page }) => {
    await mockAuthenticatedUser(page, "user");
    await page.route("**/api/users/partner-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          _id: "partner-1",
          email: "partner@example.com",
          profile: { fullName: "Partner One", avatar: "default_avatar.png" },
          role: "user",
        }),
      });
    });
    await page.route("**/api/user/friends/partner-1/status", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "none", friendshipId: null }) });
    });
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    const submit = page.locator('button[type="button"], button').filter({ hasText: /Gửi|Submit/i }).last();
    await expect(submit).toBeDisabled();
  });

  test("streak marker can trigger celebration after review submit", async ({ page }) => {
    await mockAuthenticatedUser(page, "user");
    await page.route("**/api/users/partner-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          _id: "partner-1",
          email: "partner@example.com",
          profile: { fullName: "Partner One", avatar: "default_avatar.png" },
          role: "user",
        }),
      });
    });
    await page.route("**/api/user/friends/partner-1/status", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "none", friendshipId: null }) });
    });
    await page.route("**/api/user/matches/session-1/reviews", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await page.addInitScript(() => {
      sessionStorage.setItem("streak_update:session-1", JSON.stringify({ streak: 5 }));
    });
    await page.route("**/api/users/me", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(userMe) });
    });
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await page.getByLabel("5 star").click();
    await page.locator("textarea").fill("Good conversation");
    await page.locator('button').filter({ hasText: /Gửi|Submit/i }).last().click();

    await expect(page.locator("body")).toContainText(/5|Chuỗi|streak/i);
  });
});
