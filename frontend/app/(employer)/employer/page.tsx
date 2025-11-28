"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Clock, UserCheck } from "lucide-react";
import { DashboardStats } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/formatters";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function EmployerDashboard() {
  // Dummy data for testing UI
  const stats: DashboardStats = {
    active_jobs: 12,
    total_applications: 247,
    pending_review: 38,
    shortlisted: 15,
    hired: 8,
    recent_applications: [
      {
        id: "1",
        user_id: 1,
        user_name: "John Smith",
        user_email: "john.smith@example.com",
        job_title: "Senior Full Stack Developer",
        job_listing_id: "7218561f-aae1-436f-b651-385fe03c979e",
        stage: "applied",
        rating: 85,
        applied_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: "2",
        user_id: 2,
        user_name: "Sarah Johnson",
        user_email: "sarah.j@example.com",
        job_title: "Frontend Developer",
        job_listing_id: "job-2",
        stage: "interview",
        rating: 92,
        applied_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      },
      {
        id: "3",
        user_id: 3,
        user_name: "Michael Chen",
        user_email: "mchen@example.com",
        job_title: "Senior Full Stack Developer",
        job_listing_id: "7218561f-aae1-436f-b651-385fe03c979e",
        stage: "shortlisted",
        rating: 88,
        applied_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 day ago
      },
      {
        id: "4",
        user_id: 4,
        user_name: "Emily Rodriguez",
        user_email: "emily.r@example.com",
        job_title: "Backend Engineer",
        job_listing_id: "job-3",
        stage: "applied",
        rating: 78,
        applied_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days ago
      },
      {
        id: "5",
        user_id: 5,
        user_name: "David Park",
        user_email: "dpark@example.com",
        job_title: "DevOps Engineer",
        job_listing_id: "job-4",
        stage: "rejected",
        rating: 65,
        applied_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(), // 3 days ago
      },
    ],
    recent_jobs: [
      {
        id: "7218561f-aae1-436f-b651-385fe03c979e",
        title: "Senior Full Stack Developer",
        status: "published",
        type: "full-time",
        location_requirement: "remote",
        applications_count: 42,
        posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        id: "job-2",
        title: "Frontend Developer",
        status: "published",
        type: "full-time",
        location_requirement: "hybrid",
        applications_count: 28,
        posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
      {
        id: "job-3",
        title: "Backend Engineer",
        status: "published",
        type: "full-time",
        location_requirement: "in-office",
        applications_count: 35,
        posted_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(), // 10 days ago
      },
      {
        id: "job-4",
        title: "DevOps Engineer",
        status: "draft",
        type: "full-time",
        location_requirement: "remote",
        applications_count: 0,
        posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
    ],
  };

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
