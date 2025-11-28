"use client";

import { Application } from "@/types/application";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MyApplicationListProps {
  applications: Application[];
}

export function MyApplicationList({ applications }: MyApplicationListProps) {
  console.log(
    "MyApplicationList rendered with:",
    applications.length,
    "applications"
  );
  console.log("First app:", applications[0]);

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="text-lg font-semibold">No applications yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven&apos;t applied to any jobs yet.
        </p>
        <Button asChild>
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Match Score</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.job_listing_id}>
              <TableCell className="font-medium">
                {app.job_listing?.title || "Unknown Job"}
              </TableCell>
              <TableCell>
                {/* We might need to fetch organization name or include it in job_listing */}
                {/* For now, we don't have org name in job_listing type, assuming it might be added later or we just show location */}
                {app.job_listing?.city && app.job_listing?.state_abbreviation
                  ? `${app.job_listing.city}, ${app.job_listing.state_abbreviation}`
                  : "Remote / Unspecified"}
              </TableCell>
              <TableCell>
                {app.rating ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Badge
                        className="cursor-pointer hover:opacity-80"
                        variant={
                          app.rating >= 90
                            ? "default"
                            : app.rating >= 70
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {app.rating}% Match
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">
                          AI Analysis
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {app.ai_analysis || "No detailed analysis available."}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className="text-muted-foreground text-sm">Pending</span>
                )}
              </TableCell>
              <TableCell>{formatRelativeTime(app.applied_at)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    app.stage === "hired"
                      ? "default"
                      : app.stage === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                  className="capitalize"
                >
                  {app.stage}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/jobs/${app.job_listing_id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Job
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
