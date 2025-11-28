"use client";

import { useState, useEffect } from "react";
import { ApplicationForm } from "./ApplicationForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
  hasApplied: boolean;
}

export function ApplyButton({ jobId, jobTitle, hasApplied }: ApplyButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen for submission state changes
  useEffect(() => {
    const handleSubmissionStart = () => setIsSubmitting(true);

    window.addEventListener("application-submitting", handleSubmissionStart);

    return () => {
      window.removeEventListener(
        "application-submitting",
        handleSubmissionStart
      );
    };
  }, []);

  if (isSubmitting) {
    return <Skeleton className="h-11 w-full rounded-md" />;
  }

  if (hasApplied) {
    return (
      <Button disabled size="lg" className="w-full">
        Already Applied
      </Button>
    );
  }

  return <ApplicationForm jobId={jobId} jobTitle={jobTitle} />;
}
