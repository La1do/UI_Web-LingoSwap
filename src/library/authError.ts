const BANNED_ERROR_KEYWORDS = [
  "banned",
  "ban",
  "blocked",
  "suspended",
  "khoa",
];

function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isBannedAuthError(message: string | null | undefined): boolean {
  if (!message) return false;

  const normalized = normalizeMessage(message);
  return BANNED_ERROR_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
