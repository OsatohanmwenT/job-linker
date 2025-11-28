"use client";

import { TOKEN_KEYS } from "./tokenKeys";

/**
 * Get access token from client-side (for use in browser/axios interceptors)
 * This function reads from client-side cookies
 */
export function getAccessTokenClient(): string | null {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) =>
    cookie.startsWith(`${TOKEN_KEYS.ACCESS_TOKEN}=`)
  );

  if (!tokenCookie) return null;

  return tokenCookie.split("=")[1] || null;
}

/**
 * Get user data from client-side cookies
 */
export function getUserClient(): any | null {
  if (typeof window === "undefined") return null;

  try {
    const cookies = document.cookie.split("; ");
    const userCookie = cookies.find((cookie) =>
      cookie.startsWith(`${TOKEN_KEYS.USER}=`)
    );

    if (!userCookie) return null;

    const userValue = userCookie.split("=")[1];
    const decodedUser = decodeURIComponent(userValue);
    return JSON.parse(decodedUser);
  } catch (error) {
    console.error("Error parsing user cookie:", error);
    return null;
  }
}

/**
 * Clear all auth cookies on client-side
 */
export function clearAllClient(): void {
  if (typeof window === "undefined") return;

  // Delete cookies by setting them to expire in the past
  const cookieOptions = "path=/; max-age=0";
  document.cookie = `${TOKEN_KEYS.ACCESS_TOKEN}=; ${cookieOptions}`;
  document.cookie = `${TOKEN_KEYS.REFRESH_TOKEN}=; ${cookieOptions}`;
  document.cookie = `${TOKEN_KEYS.USER}=; ${cookieOptions}`;
}
