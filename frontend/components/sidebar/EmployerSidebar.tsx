"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Building2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const sidebarItems = [
  {
    title: "Overview",
    href: "/employer",
    icon: LayoutDashboard,
  },
  {
    title: "Job Listings",
    href: "/employer/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    href: "/employer/applications",
    icon: Users,
  },
  {
    title: "Organization",
    href: "/employer/organization",
    icon: Building2,
  },
  {
    title: "Settings",
    href: "/employer/settings",
    icon: Settings,
  },
];

interface EmployerSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function EmployerSidebar({
  className,
  onNavigate,
}: EmployerSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-white dark:bg-zinc-900",
        className
      )}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight">JobLinker</h2>
        <p className="text-sm text-muted-foreground">Employer Dashboard</p>
      </div>
      <div className="flex-1 px-4 py-2">
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
