import { JobListing } from "./jobListing";

export type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "hired";

export interface Application {
  job_listing_id: string;
  user_id: number;
  cover_letter: string | null;
  rating: number | null;
  ai_analysis?: string;
  stage: ApplicationStage;
  applied_at: string;
  updated_at?: string;
  job_listing?: JobListing;
  user?: {
    id: number;
    name: string;
    email: string;
    image_url: string | null;
  };
}

export interface ApplicationCreate {
  job_listing_id: string;
  cover_letter?: string;
}

export interface ApplicationUpdate {
  stage: ApplicationStage;
}
