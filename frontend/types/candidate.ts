export interface Candidate {
  id: string;
  user_id: number;
  current_job_title?: string;
  experience_years: number;
  bio?: string;
  location?: string;
  desired_salary?: number;
  desired_location?: string;
  created_at: string;
  updated_at?: string;
}

export interface CandidateCreate {
  current_job_title?: string;
  experience_years?: number;
  bio?: string;
  location?: string;
  desired_salary?: number;
  desired_location?: string;
}
