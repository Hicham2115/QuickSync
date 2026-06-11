"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LenisProvider } from "@/components/LenisProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 2 } },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <LenisProvider>{children}</LenisProvider>
    </QueryClientProvider>
  );
}
