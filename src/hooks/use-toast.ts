"use client";

import { useCallback } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = useCallback(({ title, description }: Toast) => {
    if (typeof window !== "undefined") {
      console.log(`[Toast] ${title}: ${description || ""}`);
    }
  }, []);
  return { toast };
}
