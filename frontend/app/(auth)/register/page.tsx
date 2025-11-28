"use client";

import { useCallback } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { RegisterSchema, RegisterSchemaType } from "@/lib/schemas/auth";
import { registerUser } from "@/lib/actions/auth";
import { toast } from "sonner";

const defaultValues = {
  fullName: "",
  email: "",
  password: "",
};

export default function RegisterPage() {
  const handleRegister = useCallback(async (data: RegisterSchemaType) => {
    const result = await registerUser(data);

    if (result.success) {
      return result;
    } else {
      toast.error(result.error || "Registration failed");
      return result;
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500">Join JobLinker today</p>
        </div>
        <AuthForm
          type="SIGN_UP"
          schema={RegisterSchema}
          defaultValues={defaultValues}
          onSubmit={handleRegister as any}
        />
      </div>
    </main>
  );
}
