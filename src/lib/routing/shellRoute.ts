export function isLocaleRootPath(pathname: string | null): boolean {
  if (!pathname) return false;

  const normalized = pathname.replace(/\/+$/, "");
  const segments = normalized.split("/").filter(Boolean);

  return segments.length === 1 && (segments[0] === "ko" || segments[0] === "en");
}
