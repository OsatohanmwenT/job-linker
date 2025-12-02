"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Upload, FileText, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { resumeService } from "@/services/resumeService";
import { candidateService } from "@/services/candidateService";
import { Resume } from "@/types/resume";
import { formatRelativeTime } from "@/lib/formatters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchResume = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await resumeService.getMyResume();
      setResume(data);
    } catch (error: any) {
      if (error.message?.includes("Candidate profile not found")) {
        try {
          // Auto-create candidate profile
          await candidateService.createCandidateProfile({
            experience_years: 0,
          });
          // Retry fetching resume (will likely still return 404 for resume, but profile error is gone)
          // Actually, if we just created the profile, we know there is no resume.
          setResume(null);
        } catch (createError) {
          console.error("Failed to create profile:", createError);
          toast.error("Failed to initialize candidate profile");
        }
      } else {
        // Ignore 404 (no resume)
        setResume(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const newResume = await resumeService.uploadResume(file);
      setResume(newResume);
      toast.success("Resume uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleDelete = async () => {
    try {
      await resumeService.deleteMyResume();
      setResume(null);
      toast.success("Resume deleted");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete resume");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
        <p className="text-muted-foreground">
          Upload your resume to apply for jobs faster and get AI-powered
          insights.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resume File</CardTitle>
            <CardDescription>
              Upload your resume in PDF or DOCX format (max 5MB).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resume ? (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{resume.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {formatRelativeTime(resume.uploaded_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {resume.parse_status === "completed" && (
                    <div className="flex items-center text-sm text-green-600 mr-4">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Parsed
                    </div>
                  )}
                  {resume.parse_status === "processing" && (
                    <div className="flex items-center text-sm text-yellow-600 mr-4">
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Processing
                    </div>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your resume and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                } ${
                  isUploading
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <input {...getInputProps()} />
                <div className="rounded-full bg-muted p-4 mb-4">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                {isUploading ? (
                  <p className="text-lg font-medium">Uploading...</p>
                ) : (
                  <>
                    <p className="text-lg font-medium">
                      {isDragActive
                        ? "Drop the file here"
                        : "Drag & drop your resume here"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to select a file
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {resume && resume.ai_summary && (
          <Card>
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
              <CardDescription>
                Generated insights from your resume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p>{resume.ai_summary}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
