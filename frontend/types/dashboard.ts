export interface DashboardStats {
  active_jobs: number;
  total_applications: number;
  pending_review: number;
  shortlisted: number;
  hired: number;
  recent_applications: RecentApplication[];
  recent_jobs: RecentJob[];
}

export interface RecentApplication {
  id: string;
  job_listing_id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  job_title: string;
  rating: number | null;
  stage: string;
  applied_at: string | null;
}

export interface RecentJob {
  id: string;
  title: string;
  status: string;
  type: string;
  location_requirement: string;
  posted_at: string | null;
  applications_count: number;
}
