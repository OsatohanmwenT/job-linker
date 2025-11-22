"use client";

import AuthForm from "@/components/auth/AuthForm";
import { LoginSchema, LoginSchemaType } from "@/lib/schemas/auth";
import { loginUser } from "@/lib/actions/auth";

export default function LoginPage() {
  const handleLogin = async (data: LoginSchemaType) => {
    const result = await loginUser(data);
    console.log("wotkinh", result);

    if (result.success) {
      return result;
    } else {
      return result;
    }
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
          schema={LoginSchema}
          defaultValues={{ email: "", password: "" }}
          onSubmit={handleLogin}
        />
      </div>
    </main>
  );
}
