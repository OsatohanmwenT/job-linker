export type WageInterval = "hourly" | "yearly";

export type LocationRequirement = "remote" | "hybrid" | "in-office";

export type ExperienceLevel = "junior" | "mid-level" | "senior";

export type JobListingStatus = "draft" | "published" | "delisted";

export type JobListingType = "full-time" | "part-time" | "internship";

export interface JobListing {
  id: string;
  title: string;
  description: string;
  wage: number | null;
  wage_interval: WageInterval | null;
  state_abbreviation: string | null;
  city: string | null;
  location_requirement: LocationRequirement;
  experience_level: ExperienceLevel;
  type: JobListingType;
  organization_id: string;
  organization_name?: string;
  status: JobListingStatus;
  is_featured: boolean;
  posted_at: string | null;
  created_at: string;
  has_applied?: boolean;
}

export interface JobListingCreate {
  title: string;
  description: string;
  wage?: number | null;
  wage_interval?: WageInterval | null;
  state_abbreviation?: string | null;
  city?: string | null;
  location_requirement: LocationRequirement;
  experience_level: ExperienceLevel;
  type: JobListingType;
  organization_id: string;
  status?: JobListingStatus;
}

export interface JobListingUpdate {
  title?: string;
  description?: string;
  wage?: number | null;
  wage_interval?: WageInterval | null;
  state_abbreviation?: string | null;
  city?: string | null;
  location_requirement?: LocationRequirement;
  experience_level?: ExperienceLevel;
  type?: JobListingType;
  status?: JobListingStatus;
  is_featured?: boolean;
}

export interface JobListingFilters {
  skip?: number;
  limit?: number;
  search?: string;
  location?: string;
  experience_level?: ExperienceLevel;
  min_wage?: number;
  location_requirement?: LocationRequirement;
}
