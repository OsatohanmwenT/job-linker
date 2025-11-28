import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { jobService } from "@/services/jobService";
import { applicationService } from "@/services/applicationService";
import { ApplyButton } from "@/components/applications/ApplyButton";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import {
  formatCurrency,
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
  formatRelativeTime,
  formatWageInterval,
} from "@/lib/formatters";
import {
  Banknote,
  CalendarDays,
  MapPin,
  ArrowLeft,
  Briefcase,
  Clock,
  Globe,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface JobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: JobPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await jobService.getJobListing(id);
    return {
      title: `${job.title} | JobLinker`,
      description: `Apply for the ${job.title} position. ${
        job.city ? `Located in ${job.city}, ${job.state_abbreviation}.` : ""
      }`,
    };
  } catch {
    return {
      title: "Job Not Found | JobLinker",
    };
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;
  let job;
  let applicationStatus = null;

  try {
    job = await jobService.getJobListing(id);
  } catch {
    notFound();
  }

  // Check if user has applied to this job
  try {
    applicationStatus = await applicationService.checkApplicationStatus(id);
  } catch {
    // User hasn't applied or not logged in
    applicationStatus = null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          asChild
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </Button>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b">
            <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-muted-foreground font-medium">
                    <Building2 className="w-5 h-5" />
                    {job.organization_name || "Confidential"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                    {formatJobType(job.type)}
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {formatExperienceLevel(job.experience_level)}
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    {formatLocationRequirement(job.location_requirement)}
                  </Badge>
                  {job.is_featured && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none text-sm py-1 px-3">
                      Featured
                    </Badge>
                  )}
                  {applicationStatus && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-none text-sm py-1 px-3">
                      Applied • {applicationStatus.stage}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                <ApplyButton
                  jobId={job.id}
                  jobTitle={job.title}
                  hasApplied={!!applicationStatus}
                />
                {/* Placeholder for Save Job button */}
                <Button variant="outline" size="lg" className="w-full">
                  Save Job
                </Button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="p-4 md:p-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Salary
                </p>
                <p className="font-semibold">
                  {job.wage ? (
                    <>
                      {formatCurrency(job.wage)}
                      <span className="text-muted-foreground font-normal text-sm">
                        {job.wage_interval &&
                          formatWageInterval(job.wage_interval)}
                      </span>
                    </>
                  ) : (
                    "Competitive"
                  )}
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Location
                </p>
                <p className="font-semibold">
                  {job.city && job.state_abbreviation
                    ? `${job.city}, ${job.state_abbreviation}`
                    : "Remote / Unspecified"}
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Posted
                </p>
                <p className="font-semibold">
                  {job.posted_at
                    ? formatRelativeTime(job.posted_at)
                    : "Recently"}
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">About the Role</h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <MarkdownRenderer source={job.description} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
