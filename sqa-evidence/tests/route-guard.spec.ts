import { expect, test } from "@playwright/test";
import { expectUrlContains, mockAuthenticatedUser, mockCommonApis } from "./helpers";

test.describe("FE93-FE100 route guard", () => {
  test("FE93 redirects anonymous user from /home to /login", async ({ page }) => {
    await page.goto("/home");
    await expectUrlContains(page, "/login");
  });

  test("FE94 redirects normal user from /admin to /admin/login", async ({ page }) => {
    await mockAuthenticatedUser(page, "user");
    await page.goto("/admin");
    await expectUrlContains(page, "/admin/login");
  });

  test("FE96 allows authenticated user route after token verification", async ({ page }) => {
    await mockAuthenticatedUser(page, "user");
    await mockCommonApis(page);
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home/);
    await expect(page.locator("body")).toContainText(/Tìm|Find|Friend|Bạn/i);
  });
});
