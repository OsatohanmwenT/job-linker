export const TOKEN_KEYS = {
  ACCESS_TOKEN: "job_linker_access_token",
  REFRESH_TOKEN: "job_linker_refresh_token",
  USER: "user",
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
