"use server";

import { cookies } from "next/headers";
import { TOKEN_KEYS, COOKIE_OPTIONS } from "./tokenKeys";

/**
 * Store access token
 */
export async function setAccessToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_KEYS.ACCESS_TOKEN, token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15, // 15 minutes
  });
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_KEYS.ACCESS_TOKEN)?.value || null;
}

/**
 * Store refresh token
 */
export async function setRefreshToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_KEYS.REFRESH_TOKEN, token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_KEYS.REFRESH_TOKEN)?.value || null;
}

/**
 * Store user data
 */
export async function setUser(user: any): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_KEYS.USER, JSON.stringify(user), {
    ...COOKIE_OPTIONS,
    httpOnly: false, // Allow client-side access to user data
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Get user data
 */
export async function getUser(): Promise<any | null> {
  const cookieStore = await cookies();
  const user = cookieStore.get(TOKEN_KEYS.USER)?.value;
  return user ? JSON.parse(user) : null;
}

/**
 * Store both tokens at once
 */
export async function setTokens(
  access_token: string,
  refresh_token: string
): Promise<void> {
  await setAccessToken(access_token);
  await setRefreshToken(refresh_token);
}

/**
 * Clear all auth data
 */
export async function clearAll(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_KEYS.ACCESS_TOKEN);
  cookieStore.delete(TOKEN_KEYS.REFRESH_TOKEN);
  cookieStore.delete(TOKEN_KEYS.USER);
}

/**
 * Check if user is authenticated (has access token)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
