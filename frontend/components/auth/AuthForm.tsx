"use client";

import React, { useState } from "react";
import { ZodType } from "zod";
import {
  Controller,
  DefaultValues,
  FieldValues,
  Path,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PasswordInput from "./PasswordInput";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as TokenStorage from "@/lib/auth/tokenStorage";
import RoleDropdown from "./RoleDropdown";
import { ROLES } from "@/constants";

interface AuthFormProps<T extends FieldValues> {
  type: "SIGN_IN" | "SIGN_UP";
  schema: ZodType<T, any>;
  onSubmit?: (data: T) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    user?: any;
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
  const [isLoading, setIsLoading] = useState(false);
  const isSignIn = type === "SIGN_IN";
  const router = useRouter();

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const handleSubmit = async (data: T) => {
    if (!onSubmit) return;
    setIsLoading(true);
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
          isSignIn ? "Signed in successfully!" : "Account created successfully!"
        );

        router.push("/"); // Redirect to home/dashboard
        router.refresh();
      } else {
        toast.error(result.error || "Authentication failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "font-sans mx-auto flex w-full max-w-md flex-col",
        isSignIn ? "space-y-4" : "space-y-8"
      )}
    >
      <form
        id="auth-form"
        className=""
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup className="gap-4">
          {!isSignIn && (
            <Controller
              name={"fullName" as Path<T>}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-neutral-800" htmlFor={field.name}>
                    Full name
                  </FieldLabel>
                  <Input
                    {...field}
                    className="h-auto w-full rounded-sm border-neutral-300 py-2.5"
                    id="auth-form-fullname"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
          <Controller
            name={"email" as Path<T>}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel className="text-neutral-800" htmlFor={field.name}>
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id="auth-form-email"
                  className="h-auto w-full rounded-sm border-neutral-300 py-2.5"
                  aria-invalid={fieldState.invalid}
                  placeholder="example@mail.com"
                  autoComplete="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {!isSignIn && (
            <Controller
              name={"phone" as Path<T>}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-neutral-800" htmlFor={field.name}>
                    Phone number (optional)
                  </FieldLabel>
                  <Input
                    {...field}
                    className="h-auto w-full rounded-sm border-neutral-300 py-2.5"
                    id="auth-form-phone"
                    aria-invalid={fieldState.invalid}
                    placeholder="+1234567890"
                    autoComplete="tel"
                    type="tel"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
          {!isSignIn && (
            <Controller
              name={"role" as Path<T>}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-neutral-800" htmlFor={field.name}>
                    Role
                  </FieldLabel>
                  <RoleDropdown
                    field={field}
                    fieldState={fieldState}
                    roles={Object.values(ROLES)}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
          <Controller
            name={"password" as Path<T>}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel className="text-neutral-800" htmlFor={field.name}>
                  Password
                </FieldLabel>
                <PasswordInput field={field} fieldState={fieldState} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
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
      <Field className="gap-6" orientation="vertical">
        <Button
          className="h-auto rounded-sm py-4 hover:bg-blue-800"
          type="submit"
          disabled={isLoading}
          form="auth-form"
        >
          {isLoading ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : isSignIn ? (
            "Sign In"
          ) : (
            "Sign Up"
          )}
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
      </Field>
    </div>
  );
};

export default AuthForm;
