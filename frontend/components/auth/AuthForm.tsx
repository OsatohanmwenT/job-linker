"use client";

import React, { useCallback } from "react";
import { ZodSchema } from "zod";
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PasswordInput from "./PasswordInput";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as TokenStorage from "@/lib/auth/tokenStorage";
import { LoadingSwap } from "@/components/LoadingSwap";
import { User } from "@/types/auth";

interface AuthFormProps<T extends FieldValues> {
  type: "SIGN_IN" | "SIGN_UP";
  schema: ZodSchema<T>;
  onSubmit?: (data: T) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    user?: User;
    tokens?: { accessToken: string; refreshToken: string };
  }>;
  defaultValues: DefaultValues<T>;
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  onSubmit,
  defaultValues,
}: AuthFormProps<T>) => {
  const isSignIn = type === "SIGN_IN";

  const form = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues,
  }) as UseFormReturn<T>;

  const handleSubmit = useCallback(
    async (data: T) => {
      if (!onSubmit) return;
      try {
        const result = await onSubmit(data);
        if (result.success) {
          if (result.tokens) {
            await TokenStorage.setTokens(
              result.tokens.accessToken,
              result.tokens.refreshToken
            );
          }
          if (result.user) {
            await TokenStorage.setUser(result.user);
          }

          toast.success(
            isSignIn
              ? "Signed in successfully!"
              : "Account created successfully!"
          );

          // Force a full page reload to ensure cookies are properly set
          window.location.href = "/";
        } else {
          toast.error(result.error || "Authentication failed");
        }
      } catch {
        toast.error("An error occurred. Please try again.");
      }
    },
    [onSubmit, isSignIn]
  );

  return (
    <div
      className={cn(
        "font-sans mx-auto flex w-full max-w-md flex-col",
        isSignIn ? "space-y-4" : "space-y-8"
      )}
    >
      <Form {...form}>
        <form
          id="auth-form"
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          {!isSignIn && (
            <FormField
              control={form.control}
              name={"fullName" as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-auto w-full rounded-sm border-neutral-300 py-2.5"
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name={"email" as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-auto w-full rounded-sm border-neutral-300 py-2.5"
                    placeholder="example@mail.com"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"password" as any}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput<T> field={field} fieldState={fieldState} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {isSignIn && (
        <p className="font-sans text-right">
          <Link
            href="/forgot-password"
            className="text-neutral-800 hover:underline"
          >
            Forgot Password
          </Link>
        </p>
      )}
      <div className="flex flex-col gap-6">
        <Button
          className="h-auto rounded-sm py-4 hover:bg-blue-800"
          type="submit"
          disabled={form.formState.isSubmitting}
          form="auth-form"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            {isSignIn ? "Sign In" : "Sign Up"}
          </LoadingSwap>
        </Button>
        <p className="font-sans mb-3 text-center text-neutral-500">
          {isSignIn ? "New to JobLinker? " : "Already have an account? "}
          <Link
            className="font-medium text-neutral-800 hover:underline"
            href={isSignIn ? "/register" : "/login"}
          >
            {isSignIn ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default React.memo(AuthForm) as typeof AuthForm;
