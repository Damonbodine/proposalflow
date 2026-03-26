"use client";

import { SignUp } from "@clerk/nextjs";

export function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ProposalFlow</h1>
          <p className="mt-2 text-muted-foreground">Create your account to get started</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border border-border rounded-lg",
            },
          }}
          routing="hash"
        />
      </div>
    </div>
  );
}