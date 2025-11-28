import { BaseService } from "./baseService";
import {
  JobListing,
  JobListingCreate,
  JobListingFilters,
  JobListingUpdate,
} from "@/types/jobListing";

class JobService extends BaseService {
  constructor() {
    super("job-listings");
  }

  async getPublicJobListings(
    filters?: JobListingFilters
  ): Promise<JobListing[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.skip) params.append("skip", filters.skip.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.location) params.append("location", filters.location);
      if (filters.experience_level)
        params.append("experience_level", filters.experience_level);
      if (filters.min_wage)
        params.append("min_wage", filters.min_wage.toString());
      if (filters.location_requirement)
        params.append("location_requirement", filters.location_requirement);
    }

    const queryString = params.toString();
    const url = queryString ? `/?${queryString}` : "/";

    return this.get<JobListing[]>(url);
  }

  async getJobListing(id: string): Promise<JobListing> {
    return this.get<JobListing>(`/${id}`);
  }

  async getOrganizationJobListings(
    orgId: string,
    status?: string
  ): Promise<JobListing[]> {
    const url = status
      ? `/organization/${orgId}?status_filter=${status}`
      : `/organization/${orgId}`;
    return this.get<JobListing[]>(url);
  }

  async createJobListing(data: JobListingCreate): Promise<JobListing> {
    return this.post<JobListing, JobListingCreate>("/", data);
  }

  async updateJobListing(
    id: string,
    data: JobListingUpdate
  ): Promise<JobListing> {
    return this.patch<JobListing, JobListingUpdate>(`/${id}`, data);
  }

  async deleteJobListing(id: string): Promise<void> {
    return this.delete(`/${id}`);
  }
}

export const jobService = new JobService();
