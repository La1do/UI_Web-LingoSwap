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

  test("FE41-FE43 manages blacklist keywords", async ({ page }) => {
    await mockAuthenticatedUser(page, "admin");
    await mockAdminApis(page);
    await page.goto("/admin");
    await page.getByRole("button", { name: "Blacklist Keywords" }).click();

    await expect(page.getByText("spam")).toBeVisible();

    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("Keyword cannot be empty")).toBeVisible();

    await page.getByPlaceholder("Enter a new banned keyword").fill("abuse");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("abuse")).toBeVisible();

    await page.getByRole("row", { name: /abuse/ }).getByRole("button", { name: "Delete" }).click();
    await page.locator(".fixed").getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("abuse")).toBeHidden();
  });

  test("FE46-FE47 reads and resolves a user report", async ({ page }) => {
    await mockAuthenticatedUser(page, "admin");
    await mockAdminApis(page);
    await page.goto("/admin");
    await page.getByRole("button", { name: "User Reports" }).click();

    await expect(page.getByText("Abusive language")).toBeVisible();
    await page.getByText("Abusive language").click();
    await expect(page.getByText("User used abusive words during the call.")).toBeVisible();

    await page.getByRole("button", { name: "Mark Resolved" }).click();
    await page.getByPlaceholder("Enter notes about the decision...").fill("Warned and reviewed.");
    await page.getByRole("button", { name: "7 days" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();

    await expect(page.locator("span").filter({ hasText: /^Resolved$/ })).toBeVisible();
    await page.getByText("Abusive language").click();
    await expect(page.getByText("Warned and reviewed.")).toBeVisible();
  });

  test("FE48 bans a user account from the users table", async ({ page }) => {
    await mockAuthenticatedUser(page, "admin");
    await mockAdminApis(page);
    await page.goto("/admin");
    await page.getByRole("button", { name: "Users" }).click();

    await page.getByRole("row", { name: /user@example\.com/ }).getByRole("button", { name: "Ban" }).click();
    await page.locator(".fixed").getByRole("button", { name: "Ban" }).click();

    await expect(page.getByRole("row", { name: /user@example\.com/ })).toContainText("banned");
  });
});
