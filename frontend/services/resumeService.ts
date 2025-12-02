import { BaseService } from "./baseService";
import { Resume } from "@/types/resume";

class ResumeService extends BaseService {
  constructor() {
    super("resumes");
  }

  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append("file", file);

    return this.post<Resume, FormData>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async getMyResume(): Promise<Resume> {
    return this.get<Resume>("/my-resume");
  }

  async deleteMyResume(): Promise<void> {
    return this.delete("/my-resume");
  }
}

export const resumeService = new ResumeService();
