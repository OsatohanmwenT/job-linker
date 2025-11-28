"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applicationService } from "@/services/applicationService";
import { organizationService } from "@/services/organizationService";
import { Application } from "@/types/application";
import { formatRelativeTime } from "@/lib/formatters";
import { Loader2, Search, Filter, Eye } from "lucide-react";
import { toast } from "sonner";
import { ApplicationDetailsDialog } from "@/components/applications/ApplicationDetailsDialog";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgs = await organizationService.getMyOrganizations();
        console.log("Organizations:", orgs);
        
        if (orgs.length > 0) {
          console.log("Fetching applications for org:", orgs[0].id);
          const apps = await applicationService.getOrganizationApplications(
            orgs[0].id
          );
          console.log("Applications received:", apps);
          setApplications(apps);
        } else {
          console.log("No organizations found for this user");
          toast.error("No organization found. Please create an organization first.");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || app.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const handleViewDetails = (app: Application) => {
    setSelectedApplication(app);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">
          Manage and review all candidates across your job listings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <CardTitle>All Applications</CardTitle>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates or jobs..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No applications found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={`${app.job_listing_id}-${app.user_id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                            {app.user?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-medium">
                              {app.user?.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {app.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {app.job_listing?.title || "Unknown Job"}
                      </TableCell>
                      <TableCell>
                        {app.applied_at
                          ? formatRelativeTime(app.applied_at)
                          : "Unknown"}
                      </TableCell>
                      <TableCell>
                        {app.rating ? (
                          <Badge
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
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {app.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(app)}
                        >
                          <span className="sr-only">View Details</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ApplicationDetailsDialog
        application={selectedApplication}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
