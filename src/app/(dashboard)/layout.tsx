"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { NavSidebar } from "@/components/nav-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();

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

  return (
    <div className="flex h-screen">
      <NavSidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  );
}