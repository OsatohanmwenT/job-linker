import { BaseService } from "./baseService";
import { DashboardStats } from "@/types/dashboard";

class DashboardService extends BaseService {
  constructor() {
    super("dashboard");
  }

  async getEmployerDashboard(): Promise<DashboardStats> {
    return this.get<DashboardStats>("/employer");
  }
}

export const dashboardService = new DashboardService();
