import { expect, test } from "@playwright/test";
import { mockAuthenticatedUser, mockCommonApis } from "./helpers";

test.describe("FE101-FE109 profile and messages UI", () => {
  test("profile page renders profile, settings, and password panels", async ({ page }) => {
    await mockAuthenticatedUser(page, "user");
    await mockCommonApis(page);
    await page.goto("/profile");

    await expect(page.getByRole("heading", { name: "My Profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Edit Profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "General settings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Change password" })).toBeVisible();
  });

  test("messages page renders friend sidebar and empty chat state", async ({ page }) => {
    await mockAuthenticatedUser(page, "user");
    await mockCommonApis(page);
    await page.goto("/messages");

    await expect(page.getByText("Friend One")).toBeVisible();
    await expect(page.getByText("No conversation selected")).toBeVisible();
    await expect(page.getByText("Select a friend to start chatting")).toBeVisible();
  });
});
