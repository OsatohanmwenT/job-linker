"use client";

import { useState } from "react";
import { EmployerSidebar } from "@/components/sidebar/EmployerSidebar";
import { EmployerGuard } from "@/components/employer/EmployerGuard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black">
      {/* Desktop Sidebar */}
      <EmployerSidebar className="hidden md:flex" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center p-4 py-2 border-b bg-background">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <EmployerSidebar
                className="w-full h-full border-none"
                onNavigate={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <span className="font-bold font-sans text-lg">JobLinker</span>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <EmployerGuard>{children}</EmployerGuard>
        </main>
      </div>
    </div>
  );
}
