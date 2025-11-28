import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobListing } from "@/types/jobListing";
import {
  formatCurrency,
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
  formatRelativeTime,
  formatWageInterval,
} from "@/lib/formatters";
import { MapPin, Clock, Briefcase, Banknote, Building2 } from "lucide-react";

interface JobListingCardProps {
  job: JobListing;
}

export function JobListingCard({ job }: JobListingCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle
              className="line-clamp-1 text-xl group-hover:text-primary transition-colors"
              title={job.title}
            >
              {job.title}
            </CardTitle>
            <div className="flex flex-col gap-1">
              <CardDescription className="line-clamp-1 flex items-center gap-1 font-medium text-foreground/80">
                <Building2 className="w-3.5 h-3.5" />
                {job.organization_name || "Confidential"}
              </CardDescription>
              <CardDescription className="line-clamp-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.city && job.state_abbreviation
                  ? `${job.city}, ${job.state_abbreviation}`
                  : "Remote / Unspecified"}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {job.is_featured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                Featured
              </Badge>
            )}
            {job.has_applied && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white border-none shadow-sm">
                Applied
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grow space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <Briefcase className="w-3 h-3 mr-1.5" />
            {formatJobType(job.type)}
          </Badge>
          <Badge
            variant="secondary"
            className="font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <Clock className="w-3 h-3 mr-1.5" />
            {formatExperienceLevel(job.experience_level)}
          </Badge>
          <Badge variant="outline" className="font-medium">
            {formatLocationRequirement(job.location_requirement)}
          </Badge>
        </div>

        <div className="flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Banknote className="w-4 h-4 mr-2 text-muted-foreground" />
          {job.wage ? (
            <span>
              {formatCurrency(job.wage)}
              <span className="text-muted-foreground font-normal ml-1">
                {job.wage_interval && formatWageInterval(job.wage_interval)}
              </span>
            </span>
          ) : (
            <span>Competitive Salary</span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {job.description}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl mt-auto">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {job.posted_at ? formatRelativeTime(job.posted_at) : "Recently"}
        </span>
        <Button asChild size="sm" className="font-semibold shadow-sm">
          <Link href={`/jobs/${job.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
