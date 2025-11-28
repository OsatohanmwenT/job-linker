import {
  ExperienceLevel,
  JobListingType,
  LocationRequirement,
  WageInterval,
} from "@/types/jobListing";
import { formatDistanceToNow, parseISO } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWageInterval(interval: WageInterval): string {
  switch (interval) {
    case "hourly":
      return "/hr";
    case "yearly":
      return "/yr";
    default:
      return "";
  }
}

export function formatLocationRequirement(req: LocationRequirement): string {
  switch (req) {
    case "remote":
      return "Remote";
    case "hybrid":
      return "Hybrid";
    case "in-office":
      return "In Office";
    default:
      return req;
  }
}

export function formatExperienceLevel(level: ExperienceLevel): string {
  switch (level) {
    case "junior":
      return "Junior";
    case "mid-level":
      return "Mid Level";
    case "senior":
      return "Senior";
    default:
      return level;
  }
}

export function formatJobType(type: JobListingType): string {
  switch (type as string) {
    case "full-time":
      return "Full Time";
    case "part-time":
      return "Part Time";
    case "internship":
      return "Internship";
    default:
      return type.replace("-", " ");
  }
}

export function formatRelativeTime(dateString: string): string {
  // Parse ISO string to ensure proper timezone handling
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}
