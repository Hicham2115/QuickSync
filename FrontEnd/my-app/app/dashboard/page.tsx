"use client";

import { useAuthStore } from "@/lib/store/useAuthStore";
import { Overview } from "@/components/dashboard/Overview";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";

export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);
  return role === "employee" ? <EmployeeDashboard /> : <Overview />;
}
