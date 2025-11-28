"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Application } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeTime } from "@/lib/formatters";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { BrainCircuit, Mail, User } from "lucide-react";

interface ApplicationDetailsDialogProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationDetailsDialog({
  application,
  open,
  onOpenChange,
}: ApplicationDetailsDialogProps) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">
                {application.user?.name}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {application.user?.email}
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={
                  (application.rating || 0) >= 90
                    ? "default"
                    : (application.rating || 0) >= 70
                    ? "secondary"
                    : "outline"
                }
                className="text-lg px-3 py-1"
              >
                {application.rating
                  ? `${application.rating}% Match`
                  : "Pending"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Applied {formatRelativeTime(application.applied_at)}
              </span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* AI Analysis Section */}
            {application.ai_analysis && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <BrainCircuit className="h-5 w-5" />
                  <h3>AI Match Analysis</h3>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer source={application.ai_analysis} />
                </div>
              </div>
            )}

            {/* Cover Letter Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <Mail className="h-5 w-5" />
                <h3>Cover Letter</h3>
              </div>
              <div className="rounded-lg border p-4 bg-card text-sm leading-relaxed whitespace-pre-wrap">
                {application.cover_letter || "No cover letter provided."}
              </div>
            </div>

            {/* Job Details Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <User className="h-5 w-5" />
                <h3>Applied For</h3>
              </div>
              <div className="rounded-lg border p-4 bg-card">
                <p className="font-medium">{application.job_listing?.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {application.job_listing?.city},{" "}
                  {application.job_listing?.state_abbreviation} •{" "}
                  {application.job_listing?.type}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
