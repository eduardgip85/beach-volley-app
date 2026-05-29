import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
  getAbsoluteUrl,
  getSeoLocale,
} from "./seo";

type StructuredData = Record<string, unknown>;

interface PageSeoOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  robots?: string;
  image?: string;
  type?: string;
  structuredData?: StructuredData | StructuredData[] | null;
  noindex?: boolean;
}

function ensureMetaByName(name: string, createdNodes: HTMLElement[]) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
    createdNodes.push(meta);
  }

  return meta;
}

function ensureMetaByProperty(property: string, createdNodes: HTMLElement[]) {
  let meta = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`
  );

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
    createdNodes.push(meta);
  }

  return meta;
}

function ensureCanonicalLink(createdNodes: HTMLElement[]) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
    createdNodes.push(link);
  }

  return link;
}

function removeCreatedNode(node: HTMLElement) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

export function usePageSeo({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  canonicalPath,
  canonicalUrl,
  robots,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  structuredData,
  noindex = false,
}: PageSeoOptions) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const createdNodes: HTMLElement[] = [];
    const appendedStructuredDataScripts: HTMLScriptElement[] = [];
    const resolvedCanonicalUrl = getAbsoluteUrl(
      canonicalUrl ??
        canonicalPath ??
        (typeof window !== "undefined" ? window.location.pathname : "/")
    );
    const resolvedImageUrl = getAbsoluteUrl(image);
    const resolvedRobots = robots ?? (noindex ? "noindex, follow" : "index, follow");
    const resolvedLocale = getSeoLocale(i18n.resolvedLanguage ?? i18n.language);
    const structuredDataItems = Array.isArray(structuredData)
      ? structuredData
      : structuredData
        ? [structuredData]
        : [];

    const previousState = {
      title: document.title,
      description: document.head
        .querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.getAttribute("content") ?? null,
      robots: document.head
        .querySelector<HTMLMetaElement>('meta[name="robots"]')
        ?.getAttribute("content") ?? null,
      canonical: document.head
        .querySelector<HTMLLinkElement>('link[rel="canonical"]')
        ?.getAttribute("href") ?? null,
      ogType: document.head
        .querySelector<HTMLMetaElement>('meta[property="og:type"]')
        ?.getAttribute("content") ?? null,
      ogSiteName: document.head
        .querySelector<HTMLMetaElement>('meta[property="og:site_name"]')
        ?.getAttribute("content") ?? null,
      ogUrl: document.head
        .querySelector<HTMLMetaElement>('meta[property="og:url"]')
        ?.getAttribute("content") ?? null,
      ogTitle: document.head
        .querySelector<HTMLMetaElement>('meta[property="og:title"]')
        ?.getAttribute("content") ?? null,
      ogDescription: document.head
        .querySelector<HTMLMetaElement>('meta[property="og:description"]')
        ?.getAttribute("content") ?? null,
      ogImage: document.head
        .querySelector<HTMLMetaElement>('meta[property="og:image"]')
        ?.getAttribute("content") ?? null,
      ogLocale: document.head
        .querySelector<HTMLMetaElement>('meta[property="og:locale"]')
        ?.getAttribute("content") ?? null,
      twitterCard: document.head
        .querySelector<HTMLMetaElement>('meta[name="twitter:card"]')
        ?.getAttribute("content") ?? null,
      twitterTitle: document.head
        .querySelector<HTMLMetaElement>('meta[name="twitter:title"]')
        ?.getAttribute("content") ?? null,
      twitterDescription: document.head
        .querySelector<HTMLMetaElement>('meta[name="twitter:description"]')
        ?.getAttribute("content") ?? null,
      twitterImage: document.head
        .querySelector<HTMLMetaElement>('meta[name="twitter:image"]')
        ?.getAttribute("content") ?? null,
    };

    const descriptionTag = ensureMetaByName("description", createdNodes);
    const robotsTag = ensureMetaByName("robots", createdNodes);
    const canonicalLink = ensureCanonicalLink(createdNodes);
    const ogTypeTag = ensureMetaByProperty("og:type", createdNodes);
    const ogSiteNameTag = ensureMetaByProperty("og:site_name", createdNodes);
    const ogUrlTag = ensureMetaByProperty("og:url", createdNodes);
    const ogTitleTag = ensureMetaByProperty("og:title", createdNodes);
    const ogDescriptionTag = ensureMetaByProperty("og:description", createdNodes);
    const ogImageTag = ensureMetaByProperty("og:image", createdNodes);
    const ogLocaleTag = ensureMetaByProperty("og:locale", createdNodes);
    const twitterCardTag = ensureMetaByName("twitter:card", createdNodes);
    const twitterTitleTag = ensureMetaByName("twitter:title", createdNodes);
    const twitterDescriptionTag = ensureMetaByName(
      "twitter:description",
      createdNodes
    );
    const twitterImageTag = ensureMetaByName("twitter:image", createdNodes);

    document.title = title;
    descriptionTag.setAttribute("content", description);
    robotsTag.setAttribute("content", resolvedRobots);
    canonicalLink.setAttribute("href", resolvedCanonicalUrl);
    ogTypeTag.setAttribute("content", type);
    ogSiteNameTag.setAttribute("content", SITE_NAME);
    ogUrlTag.setAttribute("content", resolvedCanonicalUrl);
    ogTitleTag.setAttribute("content", title);
    ogDescriptionTag.setAttribute("content", description);
    ogImageTag.setAttribute("content", resolvedImageUrl);
    ogLocaleTag.setAttribute("content", resolvedLocale);
    twitterCardTag.setAttribute("content", "summary_large_image");
    twitterTitleTag.setAttribute("content", title);
    twitterDescriptionTag.setAttribute("content", description);
    twitterImageTag.setAttribute("content", resolvedImageUrl);

    structuredDataItems.forEach((item) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(item);
      script.setAttribute("data-sandset-seo-jsonld", "true");
      document.head.appendChild(script);
      appendedStructuredDataScripts.push(script);
    });

    return () => {
      document.title = previousState.title;

      if (previousState.description !== null) {
        descriptionTag.setAttribute("content", previousState.description);
      } else {
        removeCreatedNode(descriptionTag);
      }

      if (previousState.robots !== null) {
        robotsTag.setAttribute("content", previousState.robots);
      } else {
        removeCreatedNode(robotsTag);
      }

      if (previousState.canonical !== null) {
        canonicalLink.setAttribute("href", previousState.canonical);
      } else {
        removeCreatedNode(canonicalLink);
      }

      if (previousState.ogType !== null) {
        ogTypeTag.setAttribute("content", previousState.ogType);
      } else {
        removeCreatedNode(ogTypeTag);
      }

      if (previousState.ogSiteName !== null) {
        ogSiteNameTag.setAttribute("content", previousState.ogSiteName);
      } else {
        removeCreatedNode(ogSiteNameTag);
      }

      if (previousState.ogUrl !== null) {
        ogUrlTag.setAttribute("content", previousState.ogUrl);
      } else {
        removeCreatedNode(ogUrlTag);
      }

      if (previousState.ogTitle !== null) {
        ogTitleTag.setAttribute("content", previousState.ogTitle);
      } else {
        removeCreatedNode(ogTitleTag);
      }

      if (previousState.ogDescription !== null) {
        ogDescriptionTag.setAttribute("content", previousState.ogDescription);
      } else {
        removeCreatedNode(ogDescriptionTag);
      }

      if (previousState.ogImage !== null) {
        ogImageTag.setAttribute("content", previousState.ogImage);
      } else {
        removeCreatedNode(ogImageTag);
      }

      if (previousState.ogLocale !== null) {
        ogLocaleTag.setAttribute("content", previousState.ogLocale);
      } else {
        removeCreatedNode(ogLocaleTag);
      }

      if (previousState.twitterCard !== null) {
        twitterCardTag.setAttribute("content", previousState.twitterCard);
      } else {
        removeCreatedNode(twitterCardTag);
      }

      if (previousState.twitterTitle !== null) {
        twitterTitleTag.setAttribute("content", previousState.twitterTitle);
      } else {
        removeCreatedNode(twitterTitleTag);
      }

      if (previousState.twitterDescription !== null) {
        twitterDescriptionTag.setAttribute(
          "content",
          previousState.twitterDescription
        );
      } else {
        removeCreatedNode(twitterDescriptionTag);
      }

      if (previousState.twitterImage !== null) {
        twitterImageTag.setAttribute("content", previousState.twitterImage);
      } else {
        removeCreatedNode(twitterImageTag);
      }

      appendedStructuredDataScripts.forEach((script) => script.remove());
      createdNodes.forEach((node) => {
        if (document.head.contains(node)) {
          removeCreatedNode(node);
        }
      });
    };
  }, [
    canonicalPath,
    canonicalUrl,
    description,
    i18n.language,
    i18n.resolvedLanguage,
    image,
    noindex,
    robots,
    structuredData,
    title,
    type,
  ]);
}
