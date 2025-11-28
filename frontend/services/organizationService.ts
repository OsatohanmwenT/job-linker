import { BaseService } from "./baseService";
import {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationMember,
} from "@/types/organization";

class OrganizationService extends BaseService {
  constructor() {
    super("organizations");
  }

  async getMyOrganizations(): Promise<Organization[]> {
    return this.get<Organization[]>("/me");
  }

  async getOrganization(id: string): Promise<Organization> {
    return this.get<Organization>(`/${id}`);
  }

  async createOrganization(data: OrganizationCreate): Promise<Organization> {
    return this.post<Organization, OrganizationCreate>("/", data);
  }

  async updateOrganization(
    id: string,
    data: OrganizationUpdate
  ): Promise<Organization> {
    return this.put<Organization, OrganizationUpdate>(`/${id}`, data);
  }

  async deleteOrganization(id: string): Promise<void> {
    return this.delete(`/${id}`);
  }

  async getMembers(id: string): Promise<OrganizationMember[]> {
    return this.get<OrganizationMember[]>(`/${id}/members`);
  }
}

export const organizationService = new OrganizationService();
