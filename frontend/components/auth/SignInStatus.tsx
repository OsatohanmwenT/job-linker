"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function SignedIn({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : null;
}
