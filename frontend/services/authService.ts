import {
  AuthResponseData,
  BackendLoginRequest,
  BackendRegisterRequest,
  GetProfileResponse,
  LogoutResponseData,
} from "@/types/auth";

class AuthService {
  private getBaseUrl(): string {
    // Check if running on server-side
    if (typeof window === "undefined") {
      // Server-side: use VERCEL_URL or localhost
      return process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    }
    // Client-side: use relative URLs (empty string means same origin)
    return "";
  }

  private async handleRequest<TData>(
    url: string,
    options: RequestInit
  ): Promise<TData> {
    try {
      const baseUrl = this.getBaseUrl();
      const fullUrl = `${baseUrl}${url}`;
      
      const response = await fetch(fullUrl, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Request failed");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Something went wrong");
    }
  }

  async login(data: BackendLoginRequest): Promise<AuthResponseData> {
    return this.handleRequest<AuthResponseData>("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async signUp(data: BackendRegisterRequest): Promise<AuthResponseData> {
    return this.handleRequest<AuthResponseData>("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<LogoutResponseData> {
    return this.handleRequest<LogoutResponseData>("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getProfile(): Promise<GetProfileResponse> {
    return this.handleRequest<GetProfileResponse>("/api/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export const authService = new AuthService();
