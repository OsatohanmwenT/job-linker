import { jobService } from "@/services/jobService";
import { applicationService } from "@/services/applicationService";
import { JobListingList } from "@/components/jobListings/JobListingList";
import { JobSearchFilters } from "@/components/jobListings/JobSearchFilters";
import { ExperienceLevel } from "@/types/jobListing";

interface JobsPageProps {
  searchParams: Promise<{
    search?: string;
    location?: string;
    experience_level?: string;
    type?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;

  const jobs = await jobService
    .getPublicJobListings({
      search: params.search,
      location: params.location,
      experience_level: params.experience_level as ExperienceLevel,
    })
    .catch((err) => {
      console.error("Failed to fetch jobs:", err);
      return [];
    });

  // Fetch user's applications to mark applied jobs
  const myApplications = await applicationService
    .getMyApplications()
    .catch(() => []);

  const appliedJobIds = new Set(
    myApplications.map((app) => app.job_listing_id)
  );

  // Mark jobs that user has applied to
  const jobsWithAppliedStatus = jobs.map((job) => ({
    ...job,
    has_applied: appliedJobIds.has(job.id),
  }));

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans dark:bg-black">
      {/* Header Section with Background */}
      <div className="bg-white dark:bg-zinc-900 border-b relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-zinc-100/50 dark:bg-grid-zinc-800/50 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:mask-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.5))]" />
        <div className="container px-4 md:px-6 mx-auto py-12 md:py-16 relative z-10">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-50">
              Find your next <span className="text-primary">dream job</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Discover thousands of job opportunities from top companies. Our
              AI-powered matching helps you find the perfect fit.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 mx-auto -mt-8 relative z-20 pb-12">
        <div className="flex flex-col gap-8">
          {/* Search Filters */}
          <JobSearchFilters />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Latest Opportunities
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
                </span>
              </h2>
            </div>

            <JobListingList jobs={jobsWithAppliedStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
