import { expect, test, type Page } from "@playwright/test";
import { mockAuthenticatedUser, userMe } from "./helpers";

async function mockReviewPartner(page: Page, options?: { friendStatus?: string; reviewStatus?: number; meOverride?: typeof userMe }) {
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
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: options?.friendStatus ?? "none", friendshipId: options?.friendStatus === "pending" ? "friendship-1" : null }),
    });
  });
  await page.route("**/api/user/friends/partner-1/requests", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ _id: "friendship-1", status: "pending" }) });
  });
  await page.route("**/api/user/matches/session-1/reviews", async (route) => {
    await route.fulfill({ status: options?.reviewStatus ?? 200, contentType: "application/json", body: "{}" });
  });
  await page.route("**/api/user/reports", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ _id: "report-1" }) });
  });
  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(options?.meOverride ?? userMe) });
  });
}

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

test.describe("FE32-FE40 friend, review, and report UI", () => {
  test("FE32 sends friend request from review partner card", async ({ page }) => {
    await mockReviewPartner(page);
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await page.getByRole("button", { name: "Add friend" }).click();

    await expect(page.getByText("Add friend")).toBeHidden();
    await expect(page.getByText("Partner One")).toBeVisible();
  });

  test("FE33 hides add friend button when request is already pending", async ({ page }) => {
    await mockReviewPartner(page, { friendStatus: "pending" });
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await expect(page.getByText("Partner One")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add friend" })).toHaveCount(0);
  });

  test("FE38 submits a valid review and shows normal success", async ({ page }) => {
    await mockReviewPartner(page, {
      meOverride: {
        ...userMe,
        stats: { ...userMe.stats, streak: 0, learningCalendar: {} },
      },
    });
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await page.getByLabel("4 star").click();
    await page.locator("textarea").fill("Helpful partner");
    await page.getByRole("button", { name: "Submit review" }).click();

    await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible();
  });

  test("FE39 reports the reviewed user successfully", async ({ page }) => {
    await mockReviewPartner(page);
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await page.getByTitle("Report").click();
    await page.getByRole("button", { name: "Spam" }).click();
    await page.getByRole("button", { name: "Submit report" }).click();

    await expect(page.locator(".fixed").getByText("Report submitted successfully").first()).toBeVisible();
  });

  test("FE40 validates missing custom report reason", async ({ page }) => {
    await mockReviewPartner(page);
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await page.getByTitle("Report").click();
    await page.getByRole("button", { name: "Other" }).click();
    await page.getByPlaceholder("Enter the specific report reason...").fill("bad");
    await page.getByRole("button", { name: "Submit report" }).click();

    await expect(page.getByText("Please enter at least 5 characters for the report reason.")).toBeVisible();
  });
});

test.describe("FE90-FE92 streak calendar normalization", () => {
  test("FE90 renders streak celebration when learningCalendar is an array", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("streak_update:session-1", JSON.stringify({ streak: 5 }));
    });
    await mockReviewPartner(page, {
      meOverride: {
        ...userMe,
        stats: { ...userMe.stats, streak: 5, learningCalendar: ["2026-05-25", "2026-05-26"] },
      },
    });
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await page.getByLabel("5 star").click();
    await page.getByRole("button", { name: "Submit review" }).click();

    await expect(page.getByText("Day Streak!")).toBeVisible();
    await expect(page.locator("p").filter({ hasText: /^5$/ })).toBeVisible();
  });

  test("FE91 renders streak celebration when learningCalendar is an object", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("streak_update:session-1", JSON.stringify({ streak: 6 }));
    });
    await mockReviewPartner(page, {
      meOverride: {
        ...userMe,
        stats: { ...userMe.stats, streak: 6, learningCalendar: { "2026-05-25": 1, "2026-05-26": 1 } },
      },
    });
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await page.getByLabel("5 star").click();
    await page.getByRole("button", { name: "Submit review" }).click();

    await expect(page.getByText("Day Streak!")).toBeVisible();
    await expect(page.locator("p").filter({ hasText: /^6$/ })).toBeVisible();
  });

  test("FE92 keeps streak celebration usable across Monday week transition", async ({ page }) => {
    await page.addInitScript(() => {
      const fixedNow = new Date("2026-06-01T12:00:00");
      class MockDate extends Date {
        constructor(...args: ConstructorParameters<DateConstructor>) {
          super(...(args.length ? args : [fixedNow.getTime()]));
        }
        static now() {
          return fixedNow.getTime();
        }
      }
      window.Date = MockDate as DateConstructor;
      sessionStorage.setItem("streak_update:session-1", JSON.stringify({ streak: 2 }));
    });
    await mockReviewPartner(page, {
      meOverride: {
        ...userMe,
        stats: { ...userMe.stats, streak: 2, learningCalendar: { "2026-05-31": 1, "2026-06-01": 1 } },
      },
    });
    await page.goto("/review?session=session-1&partner=partner-1&duration=60");

    await page.getByLabel("5 star").click();
    await page.getByRole("button", { name: "Submit review" }).click();

    await expect(page.getByText("Day Streak!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /Continue/ })).toBeVisible();
  });
});
