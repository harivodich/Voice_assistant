import { SERVICES } from "../constant/service_targets.js";
import { cleanupAsrText } from "../utils/helper.js";

const SEARCH_WORDS =
  /\b(tìm|search|tra|tra cứu|tìm kiếm|mở|xem|nghe|bật|play|kiếm)\b/i;

const cleanupQuery = (query = "") => {
  return query
    .replace(
      /\b(youtube|spotify|google|gmail|facebook|fb|tiktok|github)\b/gi,
      "",
    )
    .replace(
      /\b(bài|nhạc|bài hát|video|clip|cho tôi|giúp tôi|dùm tôi|với)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
};

const extractQuery = (text) => {
  const t = cleanupAsrText(text);

  const patterns = [
    /\b(?:mở|bật|nghe|xem)\s+(?:cho tôi|giúp tôi|tôi)?\s*(?:một|1)?\s*(?:bài|nhạc|bài hát|video|clip)?\s*(.+?)\s*(?:trên|ở)\s+(youtube|spotify|facebook|tiktok|github|google)?$/i,

    /\b(?:nghe|bật|play)\s+(?:bài|nhạc|bài hát)?\s*(.+)$/i,

    /\b(?:xem|mở)\s+(?:video|clip)?\s*(.+)$/i,

    /\b(?:tìm|search|tra|tra cứu|tìm kiếm|kiếm)\s+(.+)$/i,

    /\b(?:mở|vào)\b.+?\b(?:và|rồi|sau đó)\b\s*(?:tìm|search|xem|nghe)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = t.match(pattern);

    if (!match) continue;

    const groups = match.slice(1).filter(Boolean);

    if (!groups.length) continue;

    let query = groups[0];

    query = cleanupQuery(query);

    if (query) return query;
  }

  return null;
};

const detectService = (text) => {
  const t = cleanupAsrText(text);

  for (const s of SERVICES) {
    for (const n of s.names) {
      if (t.includes(n)) {
        return s;
      }
    }
  }

  for (const s of SERVICES) {
    for (const d of s.domains) {
      if (t.includes(d)) {
        return s;
      }
    }
  }

  if (/\b(nhạc|bài hát|video|clip|nghe|xem)\b/i.test(t)) {
    return SERVICES.find((s) => s.id === "youtube");
  }

  return null;
};

/**
 * Google fallback search
 */
const buildGoogleFallbackSearch = ({ query, service }) => {
  if (!query) {
    return "https://www.google.com/";
  }

  if (!service?.domains?.length) {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  const domain = service.domains[0];

  return `https://www.google.com/search?q=${encodeURIComponent(
    `${query} site:${domain}`,
  )}`;
};

const pickMobileDeepLink = (service) => {
  const links = service?.mobileDeepLinks || [];
  return links[0] || null;
};

export async function deviceHandler(text, { platform = "unknown" } = {}) {
  const t = cleanupAsrText(text);

  const service = detectService(t) || SERVICES.find((s) => s.id === "google");

  const query = extractQuery(t);

  const wantsSearch = SEARCH_WORDS.test(t) || !!query;

  const isMobile = platform === "mobile";

  const openTarget =
    isMobile && pickMobileDeepLink(service)
      ? {
          kind: "app",
          deepLink: pickMobileDeepLink(service),
        }
      : {
          kind: "web",
          url: service.pcUrl,
        };

  if (wantsSearch && query) {
    if (typeof service.searchUrl === "function") {
      const url = service.searchUrl(query);

      return {
        reply: `Mình sẽ mở ${service.id} và tìm "${query}".`,
        action: {
          type: "open",
          target: "web",
          url,

          fallback: {
            type: "open",
            target: "web",
            url: buildGoogleFallbackSearch({
              query,
              service,
            }),
          },
        },
      };
    }

    return {
      reply: `Mình sẽ tìm "${query}" trên Google.`,
      action: {
        type: "open",
        target: "web",
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      },
    };
  }

  if (openTarget.kind === "app") {
    return {
      reply: `Mình sẽ mở app ${service.id}.`,
      action: {
        type: "open",
        target: "app",
        deepLink: openTarget.deepLink,

        fallback: service.pcUrl
          ? {
              type: "open",
              target: "web",
              url: service.pcUrl,
            }
          : null,
      },
    };
  }

  return {
    reply: `Mình sẽ mở ${service.id}.`,
    action: {
      type: "open",
      target: "web",
      url: openTarget.url,
    },
  };
}
