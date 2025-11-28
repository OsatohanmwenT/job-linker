"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { organizationService } from "@/services/organizationService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EmployerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOrganization = async () => {
      // Skip check if already on the organization page
      if (pathname === "/employer/organization") {
        setIsLoading(false);
        return;
      }

      try {
        const orgs = await organizationService.getMyOrganizations();
        if (orgs.length === 0) {
          toast.info("Please create your company profile to get started.");
          router.push("/employer/organization");
        }
      } catch (error) {
        console.error("Error checking organization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOrganization();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
