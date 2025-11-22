import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG } from "@/config";
import { refreshAccessToken } from "@/lib/auth/tokenRefresh";
import * as TokenStorage from "@/lib/auth/tokenStorage";

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
      const accessToken = await TokenStorage.getAccessToken();

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle 401 errors and refresh token
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      console.log("❌ Axios response error caught:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        hasResponse: !!error.response,
      });

      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const isAuthEndpoint =
        originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/register") ||
        originalRequest.url?.includes("/refresh");

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isAuthEndpoint
      ) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return instance(originalRequest);
          }
        } catch (refreshError) {
          await TokenStorage.clearAll();
          if (typeof window !== "undefined") {
            window.location.href = "/sign-in";
          }
          return Promise.reject(refreshError);
        }
      } else if (error.response?.status === 401 && isAuthEndpoint) {
        console.log("⚠️ 401 on auth endpoint, skipping refresh");
      } else if (error.response?.status === 401) {
        console.log("⚠️ 401 but already retried (_retry flag is true)");
      } else {
        console.log("⚠️ Not a 401 error, passing through");
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
