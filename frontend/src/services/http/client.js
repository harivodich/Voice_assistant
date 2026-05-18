import axios from "axios";

const TOKEN_KEY = "va_access_token";

let onUnauthorized = () => {};

export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === "function" ? fn : () => {};
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

export function getSocketBaseUrl() {
  const socket = import.meta.env.VITE_SOCKET_URL;
  if (socket) return socket.replace(/\/$/, "");
  return getApiBaseUrl().replace(/\/$/, "");
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const s = err.response?.status;
    const url = String(err.config?.url ?? "");
    const base = String(err.config?.baseURL ?? "");
    const full = base + url;
    const isAuthAttempt =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/register") ||
      full.includes("/api/auth/login") ||
      full.includes("/api/auth/register");

    if ((s === 401 || s === 403) && !isAuthAttempt) {
      onUnauthorized();
    }
    return Promise.reject(err);
  },
);
