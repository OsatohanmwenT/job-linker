"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { applicationService } from "@/services/applicationService";
import { jobService } from "@/services/jobService";
import { Application, ApplicationStage } from "@/types/application";
import { JobListing } from "@/types/jobListing";
import { ApplicationList } from "@/components/applications/ApplicationList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function JobApplicationsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<JobListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, appsData] = await Promise.all([
          jobService.getJobListing(id),
          applicationService.getJobApplications(id),
        ]);
        setJob(jobData);
        setApplications(appsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load applications");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleStatusChange = async (
    userId: string,
    newStage: ApplicationStage
  ) => {
    try {
      await applicationService.updateApplicationStage(id, userId, {
        stage: newStage,
      });
      setApplications((prev) =>
        prev.map((app) =>
          app.user_id.toString() === userId ? { ...app, stage: newStage } : app
        )
      );
      toast.success("Application status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="space-y-8">
      <div>
        <Button
          variant="ghost"
          asChild
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
        >
          <Link href="/employer/jobs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Applications for {job.title}
            </h1>
            <p className="text-muted-foreground">
              Manage candidates and track their progress.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/jobs/${job.id}`} target="_blank">
              View Job Post
            </Link>
          </Button>
        </div>
      </div>

      <ApplicationList
        applications={applications}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
