import { refreshService } from "@/services/refreshService";
import * as TokenStorage from "./tokenStorage";

export async function refreshAccessToken() {
  const refreshToken = await TokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshService.refreshAccessToken(refreshToken);

    if (accessToken) {
      await TokenStorage.setAccessToken(accessToken);
    }

    if (newRefreshToken) {
      await TokenStorage.setRefreshToken(newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    await TokenStorage.clearAll();
    throw error;
  }
}
