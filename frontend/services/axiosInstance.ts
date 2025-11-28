import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG } from "@/config";

import * as TokenStorage from "@/lib/auth/tokenStorage";
import {
  getAccessTokenClient,
  clearAllClient,
} from "@/lib/auth/tokenStorage.client";

export const createAxiosInstance = (
  clientUrl: string,
  headers?: Record<string, string>
) => {
  const instance = axios.create({
    timeout: 120000,
    baseURL: `${APP_CONFIG.API_URL}/${clientUrl}`,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  // Request interceptor - Add access token to requests
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Only try to get token on client-side (browser)
      if (typeof window !== "undefined") {
        const accessToken = getAccessTokenClient();

        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } else {
        // On server-side, try to get token from server-side storage
        try {
          const accessToken = await TokenStorage.getAccessToken();
          if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        } catch {
          // Ignore errors on server-side (e.g., no cookies available)
          console.log("No access token available on server-side");
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      console.log("❌ Axios response error caught:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        hasResponse: !!error.response,
        data: error.response?.data,
      });

      // Only redirect to login on actual authentication failures (401 Unauthorized)
      if (error.response?.status === 401) {
        const errorData = error.response?.data as any;
        // Check if it's actually an auth error, not just a validation error
        const isAuthError =
          errorData?.detail?.toLowerCase().includes("not authenticated") ||
          errorData?.detail?.toLowerCase().includes("token") ||
          errorData?.detail?.toLowerCase().includes("unauthorized");

        if (isAuthError && typeof window !== "undefined") {
          // Clear tokens on client-side
          clearAllClient();

          // Only redirect if not already on auth pages
          if (
            !window.location.pathname.includes("/login") &&
            !window.location.pathname.includes("/register")
          ) {
            window.location.href = "/login";
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
