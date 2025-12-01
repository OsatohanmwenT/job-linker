import {
  AuthResponseData,
  BackendLoginRequest,
  BackendRegisterRequest,
  GetProfileResponse,
  LogoutResponseData,
} from "@/types/auth";
import { BaseService } from "./baseService";

class AuthService extends BaseService {
  constructor() {
    super("api/auth");
  }

  async login(data: BackendLoginRequest): Promise<AuthResponseData> {
    return this.post<AuthResponseData, BackendLoginRequest>("/login", data);
  }

  async signUp(data: BackendRegisterRequest): Promise<AuthResponseData> {
    return this.post<AuthResponseData, BackendRegisterRequest>(
      "/register",
      data
    );
  }

  async logout(): Promise<LogoutResponseData> {
    return this.post<LogoutResponseData, null>("/logout", null);
  }

  async getProfile(): Promise<GetProfileResponse> {
    return this.get<GetProfileResponse>("/profile");
  }
}

export const authService = new AuthService();
