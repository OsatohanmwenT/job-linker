"use client";

import AuthForm from "@/components/auth/AuthForm";
import { loginSchema, LoginSchema } from "@/lib/schemas";

export default function LoginPage() {
  const handleLogin = async (data: LoginSchema) => {
    // Mock login logic for MVP
    console.log("Login attempt:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success
    return {
      success: true,
      user: { email: data.email, role: "SEEKER" }, // Mock user
      tokens: {
        accessToken: "mock_access_token",
        refreshToken: "mock_refresh_token",
      },
    };
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <AuthForm
          type="SIGN_IN"
          schema={loginSchema}
          defaultValues={{ email: "", password: "" }}
          onSubmit={handleLogin}
        />
      </div>
    </main>
  );
}
