import { LoginSchemaType, RegisterSchemaType } from "@/lib/schemas/auth";

export type SignInRequest = LoginSchemaType;
export type SignUpRequest = RegisterSchemaType;

// Backend-compatible types (snake_case/different field names)
export interface BackendLoginRequest {
  email: string;
  password: string;
}

export interface BackendRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  image_url: string;
}

// Backend response type
export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

// Frontend-compatible type
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
