// src/utils/profile.util.ts

import BASE_URL from "@/configs/env";

export function getProfilePicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('blob:')) return path; // local preview
  return `${BASE_URL}/${path}`;
}