import { JobListing } from "@/types/jobListing";
import { JobListingCard } from "./JobListingCard";

interface JobListingListProps {
  jobs: JobListing[];
}

export function JobListingList({ jobs }: JobListingListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No jobs found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobListingCard key={job.id} job={job} />
      ))}
    </div>
  );
}
