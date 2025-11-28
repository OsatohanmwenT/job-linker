"use client";

import { Application, ApplicationStage } from "@/types/application";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ApplicationListProps {
  applications: Application[];
  onStatusChange: (userId: string, newStage: ApplicationStage) => Promise<void>;
}

export function ApplicationList({
  applications,
  onStatusChange,
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="text-lg font-semibold">No applications yet</h3>
        <p className="text-muted-foreground">
          Wait for candidates to apply to this position.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Match Score</TableHead>
            <TableHead>Cover Letter</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.user_id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={app.user?.image_url || undefined} />
                    <AvatarFallback>
                      {app.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{app.user?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {app.user?.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatRelativeTime(app.applied_at)}</TableCell>
              <TableCell>
                {app.rating ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Badge
                        className="cursor-pointer hover:opacity-80"
                        variant={
                          app.rating >= 90
                            ? "default"
                            : app.rating >= 70
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {app.rating}% Match
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">
                          AI Analysis
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {app.ai_analysis || "No detailed analysis available."}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className="text-muted-foreground text-sm">Pending</span>
                )}
              </TableCell>
              <TableCell>
                {app.cover_letter && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cover Letter</DialogTitle>
                        <DialogDescription>
                          From {app.user?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 whitespace-pre-wrap text-sm">
                        {app.cover_letter}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={app.stage}
                  onValueChange={(val) =>
                    onStatusChange(
                      app.user_id.toString(),
                      val as ApplicationStage
                    )
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
