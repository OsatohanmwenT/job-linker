import { LoginSchemaType, RegisterSchemaType } from "@/lib/schemas/auth";

export type SignInRequest = LoginSchemaType;
export type SignUpRequest = RegisterSchemaType;

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LogoutResponseData {
  message: string;
}

export interface GetProfileResponse {
  user: User;
}
