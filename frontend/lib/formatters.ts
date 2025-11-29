import {
  ExperienceLevel,
  JobListingType,
  LocationRequirement,
  WageInterval,
} from "@/types/jobListing";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";

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

export function formatRelativeTime(dateString: string | null | undefined): string {
  // Handle null, undefined, or empty strings
  if (!dateString) {
    return "Date not available";
  }

  try {
    // Try parsing as ISO string first
    let date = parseISO(dateString);
    
    // If parseISO fails, try creating a Date object directly
    if (!isValid(date)) {
      date = new Date(dateString);
    }
    
    // Final validation check
    if (!isValid(date)) {
      console.error("Could not parse date:", dateString);
      return "Recently posted";
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return "Recently posted";
  }
}