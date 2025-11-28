import { JobSeekerHeader } from "@/components/layout/JobSeekerHeader";

export default function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <JobSeekerHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
