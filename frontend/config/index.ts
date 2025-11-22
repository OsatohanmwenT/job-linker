export const APP_CONFIG = {
  API_URL:
    typeof window === "undefined"
      ? process.env.INTERNAL_API_URL || "http://backend:8000/api/v1"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
};
