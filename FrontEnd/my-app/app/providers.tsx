"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { LenisProvider } from "@/components/LenisProvider";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/lib/axios";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Wake the backend on page load (direct call bypasses proxy timeout limits)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`).catch(() => {});
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 2 } },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <LenisProvider>
        <Toaster />
        {children}
      </LenisProvider>
    </QueryClientProvider>
  );
}
