"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { api } from "@convex/_generated/api";
import { NavSidebar } from "@/components/nav-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const createUser = useMutation(api.users.createFromClerk);
  const creatingRef = useRef(false);

  useEffect(() => {
    if (
      isAuthenticated &&
      clerkUser &&
      convexUser === null &&
      !creatingRef.current
    ) {
      creatingRef.current = true;
      createUser({
        clerkId: clerkUser.id,
        name: clerkUser.fullName ?? clerkUser.primaryEmailAddress?.emailAddress ?? "User",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        avatarUrl: clerkUser.imageUrl,
      }).finally(() => {
        creatingRef.current = false;
      });
    }
  }, [isAuthenticated, clerkUser, convexUser, createUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  // Wait for user record to exist before rendering children
  if (convexUser === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <NavSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 md:hidden">
            <SidebarTrigger />
            <span className="text-sm font-semibold">ProposalFlow</span>
          </div>
          <div className="p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}