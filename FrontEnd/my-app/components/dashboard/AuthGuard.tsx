"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { UserRole } from "@/lib/store/useAuthStore";

const ALLOWED_ROLES: UserRole[] = ["admin", "rh", "employee"];
const RESTRICTED_PATHS: Record<string, UserRole[]> = {
  "/dashboard/equipe":       ["admin"],
  "/dashboard/personnel":    ["admin", "rh"],
  "/dashboard/departements": ["admin", "rh"],
  "/dashboard/rapports":     ["admin", "rh"],
  // profile and presence are open to all roles — no entry needed
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useAuthStore((s) => s.setUser);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) { router.replace("/"); return; }

    // Use cached user to show dashboard immediately (avoids cold-start blank screen)
    const cached = localStorage.getItem("auth_user");
    if (cached) {
      try {
        const u = JSON.parse(cached);
        const role: UserRole = u.role ?? "employee";
        if (ALLOWED_ROLES.includes(role)) {
          const restricted = Object.entries(RESTRICTED_PATHS).find(([p]) => pathname.startsWith(p));
          if (restricted && !restricted[1].includes(role)) {
            router.replace("/dashboard");
            return;
          }
          setUser({ id: u.id, name: u.CompleteName ?? u.name ?? "", email: u.email, role });
          setAuthorized(true);
        }
      } catch { /* ignore bad cache */ }
    }

    // Background token validation — logs out if token is truly invalid (not just slow)
    api
      .get("/api/user", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const role: UserRole = res.data.role ?? "employee";
        if (!ALLOWED_ROLES.includes(role)) { router.replace("/"); return; }
        localStorage.setItem("auth_user", JSON.stringify(res.data));
        setUser({ id: res.data.id, name: res.data.CompleteName ?? res.data.name ?? "", email: res.data.email, role });
        setAuthorized(true);
      })
      .catch((err) => {
        const status = err?.response?.status;
        // Only force logout on explicit auth rejection — not on timeouts/network errors
        if (status === 401 || status === 403) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          router.replace("/");
        }
      });
  }, []);

  if (!authorized) return null;
  return <>{children}</>;
}
