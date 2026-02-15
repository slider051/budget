const suspiciousPathPatterns = [
  /\/\.env(?:\.|$)/i,
  /\/\.git(?:\/|$)/i,
  /wp-admin/i,
  /wp-login/i,
  /xmlrpc\.php/i,
  /phpmyadmin/i,
  /\.php(?:\/|$)/i,
  /cgi-bin/i,
  /\.\./,
  /%2e%2e/i,
  /%2f%2e/i,
  /%5c/i,
];

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

export function isSuspiciousApiPath(pathname: string): boolean {
  const decoded = safeDecode(pathname);
  return suspiciousPathPatterns.some(
    (pattern) => pattern.test(pathname) || pattern.test(decoded),
  );
}
