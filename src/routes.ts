const configuredBase = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

export const appBase = configuredBase === "/" ? "" : configuredBase;

export function appPath(path = "/") {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("mailto:") || path.startsWith("tel:")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${appBase}${normalized}` || "/";
}

export function routePath(pathname = window.location.pathname) {
  if (!appBase) return pathname;
  if (pathname === appBase || pathname === `${appBase}/`) return "/";
  return pathname.startsWith(`${appBase}/`) ? pathname.slice(appBase.length) : pathname;
}
