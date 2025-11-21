"use client";

import AuthForm from "@/components/auth/AuthForm";
import { registerSchema, RegisterSchema } from "@/lib/schemas";
import { ROLES } from "@/constants";

export default function RegisterPage() {
  const handleRegister = async (data: RegisterSchema) => {
    // Mock registration logic for MVP
    console.log("Register attempt:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success
    return {
      success: true,
      user: { email: data.email, role: data.role, fullName: data.fullName },
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
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500">Join JobLinker today</p>
        </div>
        <AuthForm
          type="SIGN_UP"
          schema={registerSchema}
          defaultValues={{
            fullName: "",
            email: "",
            phone: "",
            role: ROLES.SEEKER,
            password: "",
          }}
          onSubmit={handleRegister}
        />
      </div>
    </main>
  );
}
