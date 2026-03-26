"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: ("Admin" | "BusinessOwner" | "SalesRep")[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentUser || !allowedRoles.includes(currentUser.role as "Admin" | "BusinessOwner" | "SalesRep")) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You do not have permission to view this page. This area is restricted to{" "}
            {allowedRoles.join(", ")} users.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}