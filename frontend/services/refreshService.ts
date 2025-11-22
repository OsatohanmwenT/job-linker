import axios, { AxiosError } from "axios";
import { APP_CONFIG } from "@/config";

const refreshApi = axios.create({
  baseURL: `${APP_CONFIG.API_URL}/auth`,
  headers: { "Content-Type": "application/json" },
});

class RefreshService {
  async refreshAccessToken(refreshToken: string) {
    try {
      const response = await refreshApi.post("/refresh", {
        refreshToken,
      });
      return response.data.data;
    } catch (e) {
      if (e instanceof AxiosError) {
        throw new Error(e.response?.data?.message || e.message);
      }
      throw new Error("Something went wrong while processing your request");
    }
  }
}

export const refreshService = new RefreshService();
