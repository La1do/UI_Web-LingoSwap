import { expect, type Page } from "@playwright/test";

export const userMe = {
  _id: "user-1",
  email: "user@example.com",
  profile: {
    fullName: "Test User",
    bio: "Frontend SQA user",
    avatar: "default_avatar.png",
    language: "English",
    proficiencyLevel: "intermediate",
    country: "Vietnam",
  },
  settings: {
    theme: "light",
    uiLanguage: "vi",
  },
  stats: {
    streak: 5,
    totalHours: 12,
    totalSessions: 8,
    learningCalendar: ["2026-05-21", "2026-05-22", "2026-05-23"],
    lastStreakUpdate: "2026-05-23T08:00:00.000Z",
  },
  role: "user",
  statusAccount: "active",
};

export const adminMe = {
  ...userMe,
  _id: "admin-1",
  email: "admin@example.com",
  profile: {
    ...userMe.profile,
    fullName: "Admin User",
  },
  role: "admin",
};

export async function mockAuthenticatedUser(page: Page, role: "user" | "admin" = "user") {
  const me = role === "admin" ? adminMe : userMe;
  await page.addInitScript(({ authUser }) => {
    localStorage.setItem("access_token", "sqa-token");
    localStorage.setItem("locale", "en");
    localStorage.setItem("user", JSON.stringify({
      id: authUser._id,
      email: authUser.email,
      fullName: authUser.profile.fullName,
      avatar: authUser.profile.avatar,
      language: authUser.profile.language,
      proficiencyLevel: authUser.profile.proficiencyLevel,
      bio: authUser.profile.bio,
      country: authUser.profile.country,
      role: authUser.role,
      settings: authUser.settings,
      stats: authUser.stats,
    }));
  }, { authUser: me });

  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(me) });
  });
  await page.route("**/api/auth/logout", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}

export async function mockCommonApis(page: Page) {
  await page.route("**/api/user/friends", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          _id: "friend-1",
          email: "friend@example.com",
          fullName: "Friend One",
          avatar: "default_avatar.png",
          status: "online",
          conversationId: null,
          lastOnlineAt: { full: "", friendly: "now" },
        },
      ]),
    });
  });
  await page.route("**/api/user/friends/online", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ onlineFriendIds: ["friend-1"] }),
    });
  });
  await page.route("**/api/user/notifications**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/unread/count")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ unreadCount: 1 }) });
      return;
    }
    if (route.request().method() === "PATCH") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          _id: "notif-1",
          type: "friend_request",
          content: "Friend One sent you a friend request.",
          isRead: false,
          senderId: { _id: "friend-1", profile: { fullName: "Friend One", avatar: "default_avatar.png" } },
          metadata: { friendshipId: "friendship-1" },
        },
      ]),
    });
  });
  await page.route("**/api/user/matches**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
}

export async function mockAdminApis(page: Page) {
  await page.route("**/api/admin/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        users: { total: 42, active: 39, banned: 3, online: 7, newToday: 2, newThisWeek: 9, newThisMonth: 18 },
        matchSessions: { total: 128, today: 5, thisWeek: 24, avgDurationSeconds: 420, totalDurationSeconds: 53760 },
        messages: { total: 640, today: 18, thisWeek: 96 },
        reports: { total: 8, pending: 2, resolved: 6, today: 1 },
        friendships: { total: 31 },
      }),
    });
  });
  await page.route("**/api/admin/users", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          _id: "user-1",
          email: "user@example.com",
          role: "user",
          statusAccount: "active",
          createdAt: "2026-05-20T00:00:00.000Z",
          profile: { fullName: "Test User", avatar: "default_avatar.png" },
        },
      ]),
    });
  });
  await page.route("**/api/admin/reports**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  await page.route("**/api/admin/appeals**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  await page.route("**/api/admin/blacklist-keywords**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ total: 1, page: 1, limit: 20, keywords: [{ _id: "kw-1", keyword: "spam", createdBy: "admin-1", isActive: true, createdAt: "2026-05-20T00:00:00.000Z" }] }),
    });
  });
}

export async function expectUrlContains(page: Page, path: string) {
  await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/")));
}
