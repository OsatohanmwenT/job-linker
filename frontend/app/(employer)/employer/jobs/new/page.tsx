"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobForm } from "@/components/jobListings/JobForm";
import { JobListingSchemaType } from "@/lib/schemas/job";
import { jobService } from "@/services/jobService";
import { organizationService } from "@/services/organizationService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const orgs = await organizationService.getMyOrganizations();
        if (orgs.length > 0) {
          setOrgId(orgs[0].id);
        } else {
          toast.error("You need to create an organization first");
          router.push("/employer/organization");
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
        toast.error("Failed to load organization details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrg();
  }, [router]);

  const handleSubmit = async (data: JobListingSchemaType) => {
    if (!orgId) return;
    setIsSubmitting(true);
    try {
      await jobService.createJobListing({
        ...data,
        organization_id: orgId,
      });
      toast.success("Job listing created successfully");
      router.push("/employer/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job listing");
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

  if (!orgId) return null;

  return (
    <div className="max-w-2xl pb-10 mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground">
          Create a new job listing to find the perfect candidate.
        </p>
      </div>
      <div className="bg-card h-auto p-6 rounded-lg border shadow-sm">
        <JobForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
