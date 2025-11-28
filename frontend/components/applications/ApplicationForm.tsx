"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ApplicationSchema,
  ApplicationSchemaType,
} from "@/lib/schemas/application";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { applicationService } from "@/services/applicationService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const form = useForm<ApplicationSchemaType>({
    resolver: zodResolver(ApplicationSchema),
    defaultValues: {
      cover_letter: "",
    },
  });

  const onSubmit = async (data: ApplicationSchemaType) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to apply");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    // Dispatch event to notify parent components
    window.dispatchEvent(new Event("application-submitting"));

    try {
      await applicationService.applyToJob({
        job_listing_id: jobId,
        cover_letter: data.cover_letter,
      });
      toast.success("Application submitted successfully!");
      setIsOpen(false);
      form.reset();
      // Reload the page to show updated application status
      router.refresh();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(
        "Failed to submit application. You may have already applied."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full text-base font-semibold">
          Apply Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Submit your application for this position. Your profile and resume
            will be shared with the employer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Field>
            <FieldLabel htmlFor="cover_letter">
              Cover Letter (Optional)
            </FieldLabel>
            <Controller
              control={form.control}
              name="cover_letter"
              render={({ field, fieldState }) => (
                <>
                  <Textarea
                    id="cover_letter"
                    placeholder="Why are you a good fit for this role?"
                    className="min-h-[150px]"
                    {...field}
                  />
                  <p className="text-sm text-muted-foreground">
                    Briefly explain why you are interested in this position.
                  </p>
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </>
              )}
            />
          </Field>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <LoadingSwap isLoading={isSubmitting}>
              Submit Application
            </LoadingSwap>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
