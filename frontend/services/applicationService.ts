import { BaseService } from "./baseService";
import {
  Application,
  ApplicationCreate,
  ApplicationUpdate,
} from "@/types/application";

class ApplicationService extends BaseService {
  constructor() {
    super("applications");
  }

  async applyToJob(data: ApplicationCreate): Promise<Application> {
    return this.post<Application, ApplicationCreate>("/", data);
  }

  async getMyApplications(): Promise<Application[]> {
    return this.get<Application[]>("/me");
  }

  async checkApplicationStatus(jobId: string): Promise<{
    has_applied: boolean;
    job_listing_id: string;
    applied_at: string;
    stage: string;
    rating: number | null;
  }> {
    return this.get(`/check/${jobId}`);
  }

  async getJobApplications(jobId: string): Promise<Application[]> {
    return this.get<Application[]>(`/job/${jobId}`);
  }

  async getOrganizationApplications(orgId: string): Promise<Application[]> {
    return this.get<Application[]>(`/organization/${orgId}`);
  }

  async updateApplicationStage(
    jobId: string,
    userId: string,
    data: ApplicationUpdate
  ): Promise<Application> {
    return this.patch<Application, ApplicationUpdate>(
      `/${jobId}/${userId}`,
      data
    );
  }
}

export const applicationService = new ApplicationService();
