export const SERVICES = [
  {
    id: "youtube",
    names: ["youtube", "youtobe", "you tube"],
    pcUrl: "https://www.youtube.com/",
    mobileDeepLinks: ["vnd.youtube://", "youtube://"],
    searchUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    mobileSearchUrl: (q) => `vnd.youtube://results?search_query=${encodeURIComponent(q)}`,
  },
  {
    id: "google",
    names: ["google"],
    pcUrl: "https://www.google.com/",
    mobileDeepLinks: ["google://", "googlechrome://", "googleapp://"],
    searchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    mobileSearchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "facebook",
    names: ["facebook", "fb"],
    pcUrl: "https://www.facebook.com/",
    mobileDeepLinks: ["fb://"],
    searchUrl: (q) => `https://www.facebook.com/search/top?q=${encodeURIComponent(q)}`,
  },
  {
    id: "tiktok",
    names: ["tiktok", "tik tok"],
    pcUrl: "https://www.tiktok.com/",
    mobileDeepLinks: ["snssdk1233://", "tiktok://"],
    searchUrl: (q) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "zalo",
    names: ["zalo"],
    pcUrl: "https://chat.zalo.me/",
    mobileDeepLinks: ["zalo://"],
  },
  {
    id: "gmail",
    names: ["gmail"],
    pcUrl: "https://mail.google.com/",
    mobileDeepLinks: ["googlegmail://", "mailto:"],
  },
];
