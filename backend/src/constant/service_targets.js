export const SERVICES = [
  {
    id: "youtube",
    names: ["youtube", "youtobe", "you tube"],
    domains: ["youtube.com", "youtu.be"],
    pcUrl: "https://www.youtube.com/",
    mobileDeepLinks: ["vnd.youtube://", "youtube://"],
    searchUrl: (q) =>
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  },
  {
    id: "google",
    names: ["google"],
    domains: ["google.com"],
    pcUrl: "https://www.google.com/",
    mobileDeepLinks: ["google://"],
    searchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "facebook",
    names: ["facebook", "fb"],
    domains: ["facebook.com"],
    pcUrl: "https://www.facebook.com/",
    mobileDeepLinks: ["fb://"],
    searchUrl: (q) =>
      `https://www.facebook.com/search/top?q=${encodeURIComponent(q)}`,
  },
  {
    id: "tiktok",
    names: ["tiktok", "tik tok"],
    domains: ["tiktok.com"],
    pcUrl: "https://www.tiktok.com/",
    mobileDeepLinks: ["snssdk1233://", "tiktok://"],
    searchUrl: (q) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "zalo",
    names: ["zalo"],
    domains: [],
    pcUrl: "https://chat.zalo.me/",
    mobileDeepLinks: ["zalo://"],
    searchUrl: null,
  },
  {
    id: "gmail",
    names: ["gmail"],
    domains: ["mail.google.com"],
    pcUrl: "https://mail.google.com/",
    mobileDeepLinks: ["googlegmail://"],
    searchUrl: null,
  },
];

