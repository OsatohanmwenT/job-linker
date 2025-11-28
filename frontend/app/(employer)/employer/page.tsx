"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  UserCheck,
  Loader2,
} from "lucide-react";
import { DashboardStats } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/formatters";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { dashboardService } from "@/services/dashboardService";
import { toast } from "sonner";

export default function EmployerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getEmployerDashboard();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">No dashboard data available</p>
        <Link
          href="/employer/jobs"
          className="text-indigo-600 hover:text-indigo-700"
        >
          Create your first job posting
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your recruitment activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Job Listings
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_jobs}</div>
            <p className="text-xs text-muted-foreground">Currently published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_applications}</div>
            <p className="text-xs text-muted-foreground">
              All time applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_review}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shortlisted}</div>
            <p className="text-xs text-muted-foreground">{stats.hired} hired</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent_applications.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No recent applications to display.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recent_applications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/employer/jobs/${app.job_listing_id}/applications`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{app.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.job_title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{app.stage}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {app.applied_at &&
                          formatRelativeTime(
                            new Date(app.applied_at).toUTCString()
                          )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent_jobs.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No recent job postings to display.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recent_jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/employer/jobs/${job.id}`}
                    className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{job.title}</p>
                      <Badge
                        variant={
                          job.status === "published" ? "default" : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{job.applications_count} applications</span>
                      <span>
                        {job.posted_at &&
                          formatRelativeTime(
                            new Date(job.posted_at).toUTCString()
                          )}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
