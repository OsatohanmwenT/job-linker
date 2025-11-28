export interface Organization {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  owner_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationCreate {
  name: string;
  description?: string;
  location?: string;
  website?: string;
}

export interface OrganizationUpdate {
  name?: string;
  description?: string;
  location?: string;
  website?: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: number;
  role: "admin" | "member";
  added_at: string;
  user_name: string;
  user_email: string;
}
