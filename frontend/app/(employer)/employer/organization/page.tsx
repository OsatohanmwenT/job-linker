"use client";

import { useEffect, useState } from "react";
import { OrganizationSchemaType } from "@/lib/schemas/organization";
import { organizationService } from "@/services/organizationService";
import { Organization } from "@/types/organization";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { OrganizationForm } from "@/components/organization/OrganizationForm";

export default function OrganizationPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const orgs = await organizationService.getMyOrganizations();
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
        toast.error("Failed to load organization details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  const handleSubmit = async (data: OrganizationSchemaType) => {
    setIsSubmitting(true);
    try {
      if (organization) {
        // Update existing organization
        const updatedOrg = await organizationService.updateOrganization(
          organization.id,
          data
        );
        setOrganization(updatedOrg);
        toast.success("Organization updated successfully");
      } else {
        // Create new organization
        const newOrg = await organizationService.createOrganization(data);
        setOrganization(newOrg);
        toast.success("Organization created successfully");
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.error("Failed to save organization details");
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your company details and public profile.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <OrganizationForm
          initialData={organization || undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
