"use server";

import { authService } from "@/services/authService";
import { SignInRequest, SignUpRequest } from "@/types/auth";
import { User } from "@/types/auth";
import * as TokenStorage from "@/lib/auth/tokenStorage";

export const loginUser = async ({
  email,
  password,
}: SignInRequest): Promise<{
  success: boolean;
  error?: string;
  user?: User;
  tokens?: { accessToken: string; refreshToken?: string };
}> => {
  try {
    const response = await authService.login({ email, password });

    return {
      success: true,
      user: response.user,
      tokens: {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
    };
  } catch (error: any) {
    console.error("Login error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.response?.data?.detail || error.message || "Login failed",
    };
  }
};

export const registerUser = async (data: SignUpRequest) => {
  try {
    // Transform frontend data to match backend schema
    const backendData = {
      email: data.email,
      password: data.password,
      name: data.fullName, // Map fullName to name
    };

    const response = await authService.signUp(backendData);

    // Store tokens if returned
    if (response.accessToken) {
      await TokenStorage.setAccessToken(response.accessToken);
    }
    if (response.refreshToken) {
      await TokenStorage.setRefreshToken(response.refreshToken);
    }
    if (response.user) {
      await TokenStorage.setUser(response.user);
    }

    return {
      success: true,
      user: response.user,
      tokens: {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Registration failed" };
  }
};

export const logoutUser = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await authService.logout();
    await TokenStorage.clearAll();
    return { success: true };
  } catch (error: any) {
    console.error("Error during logout:", error);
    return { success: false, error: error.message || "Logout failed" };
  }
};

export const getCurrentUserAction = async (): Promise<
  { success: true; user: User } | { success: false; error: string }
> => {
  try {
    const response = await authService.getProfile();
    if (response.user) {
      await TokenStorage.setUser(response.user);
    }
    return { success: true, user: response.user };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to get user" };
  }
};
