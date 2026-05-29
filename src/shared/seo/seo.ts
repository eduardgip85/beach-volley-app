export const SITE_NAME = "Sandset";
export const SITE_URL = "https://sandset.app";
export const DEFAULT_SEO_DESCRIPTION =
  "Sandset helps players discover beach volleyball matches, open play sessions, private games and competitive events.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export function buildSeoTitle(pageTitle: string) {
  return pageTitle.includes(SITE_NAME) ? pageTitle : `${pageTitle} | ${SITE_NAME}`;
}

export function getAbsoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) {
    return SITE_URL;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (pathOrUrl.startsWith("/")) {
    return `${SITE_URL}${pathOrUrl}`;
  }

  return `${SITE_URL}/${pathOrUrl}`;
}

export function getSeoLocale(language?: string | null) {
  return language?.startsWith("es") ? "es_ES" : "en_US";
}
