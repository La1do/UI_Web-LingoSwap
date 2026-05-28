export function clearAuthSession(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}
