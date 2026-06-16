"use client";
import Link from "next/link";
import { UserPlus, CalendarPlus, Building2, FileDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { StatusBadge } from "./shared/StatusBadge";
import { EmpAvatar } from "./shared/EmpAvatar";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  total_employees: number;
  pending_leaves: number;
  presence_rate: number;
  presence_delta: number;
  total_departments: number;
  recent_leaves: {
    id: number;
    employee: string;
    dept: string;
    type: string;
    from: string;
    to: string;
    days: number;
    status: "en_attente" | "approuve" | "refuse";
  }[];
}

function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  trend,
  loading,
}: {
  label: string;
  value: string | number;
  delta?: number | string;
  deltaLabel?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}) {
  const trendColor =
    trend === "up" ? "#2E7D5B" : trend === "down" ? "#B4453A" : "#76766C";
  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "";

  return (
    <div
      className="bg-white border border-warm-200 rounded-xl p-5 flex flex-col gap-2.5"
      style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-warm-500">
        {label}
      </p>
      {loading ? (
        <>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-3 w-28" />
        </>
      ) : (
        <>
          <p
            className="font-display text-[36px] font-medium leading-none text-ink-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            {value}
          </p>
          <div className="flex items-center gap-1.5">
            {arrow && delta !== undefined && (
              <span className="font-sans text-[12px] font-semibold" style={{ color: trendColor }}>
                {arrow} {typeof delta === "number" ? `${Math.abs(delta)}%` : delta}
              </span>
            )}
            {deltaLabel && (
              <span className="font-sans text-[12px] text-warm-500">{deltaLabel}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const QUICK_ACTIONS = [
  { icon: UserPlus,    label: "Ajouter un employé",      href: "/dashboard/personnel" },
  { icon: CalendarPlus,label: "Nouvelle demande",         href: "/dashboard/conges" },
  { icon: Building2,   label: "Gérer les départements",   href: "/dashboard/departements" },
  { icon: FileDown,    label: "Exporter le rapport",      href: "/dashboard/rapports" },
];

export function Overview() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/dashboard/stats");
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur de chargement.");
        throw err;
      }
    },
    refetchInterval: 60_000,
  });

  const presenceTrend =
    !data ? "neutral"
    : data.presence_delta > 0 ? "up"
    : data.presence_delta < 0 ? "down"
    : "neutral";

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-5 lg:gap-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl px-5 sm:px-8 py-5 sm:py-6 relative overflow-hidden flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: "linear-gradient(140deg,#0F1729 0%,#131B2C 50%,#1A253C 100%)" }}
      >
        <div
          className="absolute top-[-20%] right-0 w-[40%] h-[140%] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 30%, rgba(203,162,74,.18), transparent 60%)" }}
        />
        <div className="relative z-10">
          <p className="font-display text-[18px] sm:text-[22px] font-medium text-white mb-1">
            Bonjour, {user?.name ?? "…"} 👋
          </p>
          <p className="font-sans text-[13px]" style={{ color: "rgba(255,255,255,.55)" }}>
            Voici le résumé de votre activité du jour.
          </p>
        </div>
        <p
          className="relative z-10 font-mono text-[11px] capitalize sm:text-right"
          style={{ color: "rgba(255,255,255,.35)", letterSpacing: ".06em" }}
        >
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })}
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Effectif total"
          value={data?.total_employees ?? 0}
          deltaLabel="collaborateurs"
          trend="neutral"
          loading={isLoading}
        />
        <StatCard
          label="Congés en attente"
          value={data?.pending_leaves ?? 0}
          deltaLabel="à traiter"
          trend={data && data.pending_leaves > 0 ? "down" : "neutral"}
          loading={isLoading}
        />
        <StatCard
          label="Taux de présence"
          value={data ? `${data.presence_rate}%` : "–"}
          delta={data?.presence_delta}
          deltaLabel="vs mois dernier"
          trend={presenceTrend}
          loading={isLoading}
        />
        <StatCard
          label="Départements"
          value={data?.total_departments ?? 0}
          deltaLabel="départements actifs"
          trend="neutral"
          loading={isLoading}
        />
      </div>

      {/* 2-col on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Recent leaves table */}
        <div
          className="bg-white border border-warm-200 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}
        >
          <div
            className="px-4 sm:px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #DEDED8" }}
          >
            <span className="font-display text-[15px] sm:text-[17px] font-medium text-ink-900">
              Dernières demandes de congés
            </span>
            <Link
              href="/dashboard/conges"
              className="font-sans text-[13px] font-medium text-ink-400 hover:text-ink-600 transition-colors no-underline shrink-0 ml-3"
            >
              Voir tout →
            </Link>
          </div>

          {/* Table header */}
          <div className="px-4 sm:px-5 py-2.5 bg-warm-50" style={{ borderBottom: "1px solid #DEDED8" }}>
            <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_auto] lg:grid-cols-[2fr_1fr_1.2fr_auto] w-full items-center gap-2">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500">EMPLOYÉ</span>
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 hidden md:block">TYPE</span>
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 hidden lg:block">PÉRIODE</span>
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500">STATUT</span>
            </div>
          </div>

          {/* Rows */}
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 sm:px-5 py-3.5" style={{ borderBottom: "1px solid #DEDED8" }}>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="py-10 text-center">
              <p className="font-sans text-[13px] text-warm-400">Impossible de charger les données.</p>
            </div>
          ) : (data?.recent_leaves ?? []).length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-sans text-[13px] text-warm-400">Aucune demande récente.</p>
            </div>
          ) : (
            (data?.recent_leaves ?? []).map((l, i, arr) => (
              <div
                key={l.id}
                className="px-4 sm:px-5 py-3 transition-colors hover:bg-warm-50 cursor-pointer"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid #DEDED8" : "none" }}
              >
                <div className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_auto] lg:grid-cols-[2fr_1fr_1.2fr_auto] w-full items-center gap-2">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <EmpAvatar name={l.employee} size={30} />
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] font-medium text-ink-900 leading-tight truncate">
                        {l.employee}
                      </p>
                      <p className="font-sans text-[11px] text-warm-500 truncate">{l.dept}</p>
                    </div>
                  </div>
                  <span className="font-sans text-[12px] text-ink-900 hidden md:block">{l.type}</span>
                  <span className="font-mono text-[11px] text-warm-500 hidden lg:block">
                    {l.from.split(" ").slice(0, 2).join(" ")}–{l.to.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick actions */}
        <div
          className="bg-white border border-warm-200 rounded-2xl p-4 sm:p-5"
          style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}
        >
          <p className="font-display text-[16px] font-medium text-ink-900 mb-3.5">Actions rapides</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {QUICK_ACTIONS.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50 font-sans text-[13px] font-medium text-ink-900 no-underline transition-all hover:bg-ink-50 hover:border-ink-200 hover:text-ink-500 duration-150"
              >
                <Icon size={15} aria-hidden="true" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
