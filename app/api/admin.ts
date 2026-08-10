const ADMIN_SESSION_KEY = "classroom-leaderboard-admin-session";

// Change this to whatever password you want the admin panel to use.
const ADMIN_PASSWORD = "rahin1234";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loginAdmin(password: string): boolean {
  if (!isBrowser()) return false;
  if (password === ADMIN_PASSWORD) {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminLoggedIn(): boolean {
  if (!isBrowser()) return false;
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}