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
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useAuthStore((s) => s.setUser);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/");
      return;
    }

    api
      .get("/api/user", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const role: UserRole = res.data.role ?? "employee";

        if (!ALLOWED_ROLES.includes(role)) {
          router.replace("/");
          return;
        }

        const restricted = Object.entries(RESTRICTED_PATHS).find(([path]) =>
          pathname.startsWith(path)
        );
        if (restricted && !restricted[1].includes(role)) {
          router.replace("/dashboard");
          return;
        }

        setUser({
          id: res.data.id,
          name: res.data.CompleteName ?? res.data.name ?? "",
          email: res.data.email,
          role,
        });

        setAuthorized(true);
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        router.replace("/");
      });
  }, [router, pathname, setUser]);

  if (!authorized) return null;

  return <>{children}</>;
}
