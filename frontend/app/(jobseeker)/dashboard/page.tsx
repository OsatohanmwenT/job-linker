"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/services/applicationService";
import { Application } from "@/types/application";
import { MyApplicationList } from "@/components/applications/MyApplicationList";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard useEffect - Auth state:", {
      isAuthLoading,
      isAuthenticated,
    });

    if (!isAuthLoading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    const fetchApplications = async () => {
      try {
        console.log("Fetching applications...");
        const data = await applicationService.getMyApplications();
        console.log("Applications received:", data);
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error(
          `Failed to load your applications: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      console.log("Authenticated, fetching applications");
      fetchApplications();
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
          <MyApplicationList applications={applications} />
        </div>
      </div>
    </div>
  );
}
