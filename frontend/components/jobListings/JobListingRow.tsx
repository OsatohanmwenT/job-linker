import { JobListing } from "@/types/jobListing";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatExperienceLevel,
  formatJobType,
  formatRelativeTime,
} from "@/lib/formatters";
import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobListingRowProps {
  job: JobListing;
  isSelected: boolean;
  onClick: () => void;
}

export function JobListingRow({
  job,
  isSelected,
  onClick,
}: JobListingRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        isSelected
          ? "bg-zinc-100 dark:bg-zinc-800 border-primary/20 shadow-sm"
          : "bg-white dark:bg-zinc-900"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          {/* Logo placeholder if we had one */}
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-primary">
            {job.title.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-sm line-clamp-1">{job.title}</h3>
            <p className="text-xs text-muted-foreground">Company Name</p>
          </div>
        </div>
        {job.posted_at && (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(job.posted_at)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.is_featured && (
          <Badge
            variant="default"
            className="text-[10px] px-1.5 py-0 h-5 bg-purple-600 hover:bg-purple-700"
          >
            Featured
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          {formatJobType(job.type)}
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          {formatExperienceLevel(job.experience_level)}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-[100px]">
            {job.city && job.state_abbreviation
              ? `${job.city}, ${job.state_abbreviation}`
              : "Remote"}
          </span>
        </div>
        {job.wage && (
          <span className="font-medium text-foreground">
            {formatCurrency(job.wage)}
          </span>
        )}
      </div>
    </div>
  );
}
