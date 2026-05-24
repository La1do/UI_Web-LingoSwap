import { expect, test } from "@playwright/test";
import { mockAdminApis, mockAuthenticatedUser } from "./helpers";

test.describe("FE110-FE124 admin UI", () => {
  test("admin login page validates missing credentials", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("locale", "en"));
    await page.goto("/admin/login");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Please enter email and password.")).toBeVisible();
  });

  test("admin dashboard renders mocked overview stats", async ({ page }) => {
    await mockAuthenticatedUser(page, "admin");
    await mockAdminApis(page);
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByText("Total Users")).toBeVisible();
    await expect(page.getByText("Pending Reports")).toBeVisible();
  });

  test("admin users tab renders mocked user table", async ({ page }) => {
    await mockAuthenticatedUser(page, "admin");
    await mockAdminApis(page);
    await page.goto("/admin");
    await page.getByRole("button", { name: "Users" }).click();

    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByText("user@example.com")).toBeVisible();
  });
});
