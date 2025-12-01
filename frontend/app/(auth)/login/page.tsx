"use client";

import { useCallback } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { LoginSchema, LoginSchemaType } from "@/lib/schemas/auth";
import { loginUser } from "@/lib/actions/auth";
import * as TokenStorage from "@/lib/auth/tokenStorage";

const defaultValues = { email: "", password: "" };

export default function LoginPage() {
  const handleLogin = useCallback(async (data: LoginSchemaType) => {
    const result = await loginUser(data);


    if (result.success) {
    if (result.tokens) {
      await TokenStorage.setAccessToken(result.tokens.accessToken);
      if (result.tokens.refreshToken) {
        await TokenStorage.setRefreshToken(result.tokens.refreshToken);
      }
    }
    if (result.user) {
      await TokenStorage.setUser(result.user);
    }
  }
  return result;
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <AuthForm
          type="SIGN_IN"
          schema={LoginSchema}
          defaultValues={defaultValues}
          onSubmit={handleLogin as any}
        />
      </div>
    </main>
  );
}
