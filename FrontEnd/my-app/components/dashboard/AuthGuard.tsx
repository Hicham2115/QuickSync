"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/");
      return;
    }

    api
      .get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.role !== "admin") {
          router.replace("/");
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        router.replace("/");
      });
  }, [router]);

  if (!authorized) return null;

  return <>{children}</>;
}
