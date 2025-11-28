"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function JobSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [level, setLevel] = useState(searchParams.get("level") || "all");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (type && type !== "all") params.set("type", type);
    if (level && level !== "all") params.set("experience_level", level);

    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-[calc(100vh-2rem)] sticky top-4 gap-6">
      <div className="flex items-center gap-2 px-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl">JobLinker</span>
      </div>

      <div className="space-y-6 overflow-y-auto pr-2 flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Job Title
            </Label>
            <Input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Location
            </Label>
            <Input
              placeholder="City, state..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Job Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900/50">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Experience Level
            </Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900/50">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid-level">Mid Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleFilter} className="w-full">
            Filter Jobs
          </Button>
        </div>

        <div className="pt-6 border-t space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 block">
            Menu
          </Label>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            asChild
          >
            <Link href="/jobs">
              <Briefcase className="h-4 w-4" />
              Job Board
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            asChild
          >
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          {/* Add more links as needed */}
        </div>
      </div>

      {user && (
        <div className="pt-4 border-t mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
              {user.image_url ? (
                <img
                  src={user.image_url}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}
