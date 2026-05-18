import { createContext } from "react";

export const userDataContext = createContext(null);

export function normalizeUser(u) {
  if (!u) return null;
  const p = u.profile || {};
  return {
    ...u,
    assistantName: u.assistant_name ?? p.assistant_name ?? null,
    assistantImage: u.assistant_image ?? p.assistant_image ?? null,
  };
}
