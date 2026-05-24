import { expect, test } from "@playwright/test";
import { mockAuthenticatedUser, mockCommonApis } from "./helpers";

test.describe("FE65-FE70 notification UI", () => {
  test("notification dropdown renders unread notification and supports mark read", async ({ page }) => {
    await mockAuthenticatedUser(page, "user");
    await mockCommonApis(page);
    await page.goto("/home");

    const bell = page.getByLabel("Notifications");
    await bell.hover();

    await expect(page.locator("body")).toContainText("Friend One sent you a friend request.");
    await expect(page.getByRole("button", { name: "Mark as read" })).toBeVisible();
  });
});
