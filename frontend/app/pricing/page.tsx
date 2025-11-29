"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Briefcase, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Find Jobs", href: "/jobs" },
  { name: "For Employers", href: "/employer/jobs" },
  { name: "Pricing", href: "/pricing" },
  { name: "Dashboard", href: "/dashboard" },
];

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/register",
    priceMonthly: "$0",
    description: "Perfect for getting started with your job search.",
    features: [
      "Create a professional profile",
      "Apply to up to 5 jobs per day",
      "Basic AI job matching",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "/register?plan=pro",
    priceMonthly: "$19",
    description: "Unlock advanced features to land your dream job faster.",
    features: [
      "Unlimited job applications",
      "Priority AI ranking",
      "See who viewed your profile",
      "Salary insights & market data",
      "Resume optimization tools",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "/contact",
    priceMonthly: "Custom",
    description: "For companies hiring at scale.",
    features: [
      "Unlimited job postings",
      "Advanced candidate filtering",
      "AI-powered candidate ranking",
      "Dedicated account manager",
      "API access",
      "SSO & advanced security",
    ],
    featured: false,
  },
];

export default function PricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      {/* Header (Reused from Landing Page) */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="sr-only">JobLinker</span>
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                JobLinker
              </span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            >
              <span className="sr-only">Open main menu</span>
              <Menu aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              href="/login"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-zinc-950 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <span className="sr-only">JobLinker</span>
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
              >
                <span className="sr-only">Close menu</span>
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-500/20">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-900"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-900"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Pricing plans for teams of&nbsp;all&nbsp;sizes
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-400">
            Choose the perfect plan for your needs. Whether you&apos;re a job seeker
            looking for your next role or an employer hiring top talent.
          </p>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier, tierIdx) => (
              <div
                key={tier.id}
                className={cn(
                  tier.featured ? "lg:z-10 lg:rounded-b-none" : "lg:mt-8",
                  tierIdx === 0 ? "lg:rounded-r-none" : "",
                  tierIdx === tiers.length - 1 ? "lg:rounded-l-none" : "",
                  "flex flex-col justify-between rounded-3xl bg-white dark:bg-zinc-900 p-8 ring-1 ring-gray-200 dark:ring-gray-800 xl:p-10"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3
                      id={tier.id}
                      className={cn(
                        tier.featured
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-900 dark:text-gray-100",
                        "text-lg font-semibold leading-8"
                      )}
                    >
                      {tier.name}
                    </h3>
                    {tier.featured ? (
                      <p className="rounded-full bg-indigo-600/10 dark:bg-indigo-400/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600 dark:text-indigo-400">
                        Most popular
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {tier.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      {tier.priceMonthly}
                    </span>
                    {tier.priceMonthly !== "Custom" && (
                      <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                        /month
                      </span>
                    )}
                  </p>
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400"
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={cn(
                    tier.featured
                      ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                      : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 dark:ring-indigo-800 dark:hover:ring-indigo-700",
                    "mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  )}
                >
                  {tier.priceMonthly === "Custom"
                    ? "Contact sales"
                    : "Get started today"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
