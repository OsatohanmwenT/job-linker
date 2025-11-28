"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { JobForm } from "@/components/jobListings/JobForm";
import { JobListingSchemaType } from "@/lib/schemas/job";
import { jobService } from "@/services/jobService";
import { JobListing } from "@/types/jobListing";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<JobListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobService.getJobListing(id);
        setJob(data);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
        router.push("/employer/jobs");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, router]);

  const handleSubmit = async (data: JobListingSchemaType) => {
    setIsSubmitting(true);
    try {
      await jobService.updateJobListing(id, data);
      toast.success("Job listing updated successfully");
      router.push("/employer/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job listing");
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Job Listing</h1>
        <p className="text-muted-foreground">
          Update the details of your job posting.
        </p>
      </div>
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <JobForm
          initialData={job}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
