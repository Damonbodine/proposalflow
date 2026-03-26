"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Users, Calendar, ArrowRight } from "lucide-react";

export default function RootPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              PF
            </div>
            <span className="text-xl font-bold">ProposalFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Sales proposals,{" "}
            <span className="text-primary">simplified</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Manage your sales pipeline, create professional proposals, and close
            deals faster with ProposalFlow.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-24">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 text-card-foreground">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Contact Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track leads, manage relationships, and keep your pipeline organized.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-card-foreground">
              <FileText className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Proposal Builder</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create, send, and track professional proposals with templates and line items.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-card-foreground">
              <Calendar className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold">Meeting Scheduler</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Schedule meetings, set reminders, and never miss a follow-up.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
