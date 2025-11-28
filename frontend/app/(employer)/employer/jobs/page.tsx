"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Users,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { JobListing } from "@/types/jobListing";
import { formatRelativeTime } from "@/lib/formatters";
import { toast } from "sonner";
import { organizationService } from "@/services/organizationService";
import { jobService } from "@/services/jobService";

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // First get the organization
        const orgs = await organizationService.getMyOrganizations();
        if (orgs.length > 0) {
          // Then fetch jobs for that organization
          const orgJobs = await jobService.getOrganizationJobListings(
            orgs[0].id
          );
          setJobs(orgJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load job listings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job listing?")) return;

    try {
      await jobService.deleteJobListing(id);
      setJobs(jobs.filter((job) => job.id !== id));
      toast.success("Job listing deleted");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job listing");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Listings</h1>
          <p className="text-muted-foreground">
            Manage your job postings and view their status.
          </p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>
            A list of all your job postings including draft and published jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t posted any jobs yet.
              </p>
              <Button variant="outline" asChild>
                <Link href="/employer/jobs/new">Create your first job</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/employer/jobs/${job.id}`}
                        className="hover:underline"
                      >
                        {job.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "published"
                            ? "default"
                            : job.status === "draft"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {job.type.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      {job.posted_at ? formatRelativeTime(job.posted_at) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/jobs/${job.id}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              View Live
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/employer/jobs/${job.id}/applications`}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              View Applications
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/employer/jobs/${job.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(job.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
