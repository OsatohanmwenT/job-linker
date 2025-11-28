"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Filter, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function JobSearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params - no need for useEffect
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [location, setLocation] = useState(
    () => searchParams.get("location") || ""
  );
  const [level, setLevel] = useState(
    () => searchParams.get("experience_level") || "all"
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());
    if (level && level !== "all") params.set("experience_level", level);

    router.push(`/jobs?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setLocation("");
    setLevel("all");
    router.push("/jobs");
  };

  const hasActiveFilters = search || location || (level && level !== "all");

  return (
    <Card className="p-4 border shadow-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <CardContent className="px-2">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search jobs, keywords, or companies..."
              className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex-1 relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="City, state, or remote..."
              className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/20"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="py-5 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary/20">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span className="text-foreground">
                    <SelectValue placeholder="Experience" />
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid-level">Mid Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="h-11 px-4"
                size="lg"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={handleSearch}
              className="h-11 px-8 font-semibold shadow-sm"
              size="lg"
            >
              Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
