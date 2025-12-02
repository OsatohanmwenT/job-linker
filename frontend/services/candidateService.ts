import { BaseService } from "./baseService";
import { Candidate, CandidateCreate } from "@/types/candidate";

class CandidateService extends BaseService {
  constructor() {
    super("candidates");
  }

  async createCandidateProfile(data: CandidateCreate): Promise<Candidate> {
    return this.post<Candidate, CandidateCreate>("/", data);
  }

  async getMyProfile(): Promise<Candidate> {
    return this.get<Candidate>("/me");
  }
}

export const candidateService = new CandidateService();
