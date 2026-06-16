"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import {
  CalendarPlus, CalendarDays, Stethoscope, Clock,
  CheckCircle, XCircle, Bell, Users, TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { EmpAvatar } from "./shared/EmpAvatar";
import { StatusBadge } from "./shared/StatusBadge";
import { MyLeaveModal } from "./MyLeaveModal";

interface Balance {
  annual: { total: number; used: number; remaining: number };
  sick:   { total: number; used: number; remaining: number };
  other:  { used: number };
  pending: number;
}

interface MyLeave {
  id: number;
  type: string;
  from: string;
  to: string;
  days: number;
  status: "en_attente" | "approuve" | "refuse";
  reason: string;
  updated_at: string;
}

interface Notification {
  id: number;
  type: string;
  status: "approuve" | "refuse";
  days: number;
  date: string;
}

interface TeamMember {
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
}

interface TeamCalendar {
  dept: string;
  leaves: TeamMember[];
}

interface Profile {
  name: string;
  email: string;
  role: string;
  dept: string;
  title: string;
  hired: string;
  status: string;
}

const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const MONTH = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

export function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [leaveOpen, setLeaveOpen] = useState(false);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      try { return (await api.get("/api/me/profile")).data; }
      catch (err) { if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur"); throw err; }
    },
  });

  const { data: balance, isLoading: balanceLoading } = useQuery<Balance>({
    queryKey: ["my-balance"],
    queryFn: async () => {
      try { return (await api.get("/api/me/balance")).data; }
      catch (err) { if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur"); throw err; }
    },
  });

  const { data: myLeaves = [], isLoading: leavesLoading } = useQuery<MyLeave[]>({
    queryKey: ["my-leaves"],
    queryFn: async () => {
      try { return (await api.get("/api/me/leaves")).data; }
      catch (err) { if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur"); throw err; }
    },
  });

  const { data: notifData, isLoading: notifLoading } = useQuery<{ notifications: Notification[]; unread: number }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      try { return (await api.get("/api/me/notifications")).data; }
      catch (err) { if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur"); throw err; }
    },
  });
  const notifications = notifData?.notifications ?? [];

  const { data: teamData, isLoading: teamLoading } = useQuery<TeamCalendar>({
    queryKey: ["my-team"],
    queryFn: async () => {
      try { return (await api.get("/api/me/team")).data; }
      catch (err) { if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur"); throw err; }
    },
  });

  const firstName = (user?.name ?? profile?.name ?? "").split(" ")[0];

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-5">

      {/* ── Hero header ─────────────────────────────────────── */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg,#1A253C,#2C3E63)" }}
      >
        <div>
          <p className="font-sans text-[12px] text-white/50 mb-1 capitalize">{today}</p>
          <h1 className="font-display text-[24px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
            Bonjour, {firstName} 👋
          </h1>
          <p className="font-sans text-[13px] text-white/60 mt-1">
            {profile?.title ?? "–"} · {profile?.dept ?? "–"}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/dashboard/presence")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-sans text-[13px] font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Pointer ma présence
          </button>
          <button
            onClick={() => setLeaveOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-sans text-[13px] font-bold border-none cursor-pointer"
            style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 10px rgba(180,134,47,.3)" }}
          >
            <CalendarPlus size={15} aria-hidden="true" />
            Demander un congé
          </button>
        </div>
      </div>

      {/* ── Leave balance cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Annual */}
        <button onClick={() => router.push("/dashboard/conges")} className="bg-white border border-warm-200 rounded-xl p-5 text-left hover:shadow-md transition-shadow cursor-pointer" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#EEF2F9" }}>
              <CalendarDays size={16} color="#2C3E63" aria-hidden="true" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-warm-400">Congés annuels</span>
          </div>
          {balanceLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <p className="font-display text-[32px] font-medium leading-none text-ink-900 mb-1" style={{ letterSpacing: "-0.02em" }}>
              {balance?.annual.remaining ?? "–"}
              <span className="font-sans text-[13px] font-normal text-warm-400 ml-1">/ {balance?.annual.total ?? 30}j</span>
            </p>
          )}
          <p className="font-sans text-[12px] text-warm-500 mb-3">{balance?.annual.used ?? 0} j utilisés cette année</p>
          <div className="h-1.5 rounded-full bg-warm-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${balance ? (balance.annual.used / balance.annual.total) * 100 : 0}%`, background: "#2C3E63" }}
            />
          </div>
        </button>

        {/* Sick */}
        <button onClick={() => router.push("/dashboard/conges")} className="bg-white border border-warm-200 rounded-xl p-5 text-left hover:shadow-md transition-shadow cursor-pointer" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#EDFAF3" }}>
              <Stethoscope size={16} color="#2E7D5B" aria-hidden="true" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-warm-400">Congés maladie</span>
          </div>
          {balanceLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <p className="font-display text-[32px] font-medium leading-none text-ink-900 mb-1" style={{ letterSpacing: "-0.02em" }}>
              {balance?.sick.remaining ?? "–"}
              <span className="font-sans text-[13px] font-normal text-warm-400 ml-1">/ {balance?.sick.total ?? 15}j</span>
            </p>
          )}
          <p className="font-sans text-[12px] text-warm-500 mb-3">{balance?.sick.used ?? 0} j utilisés cette année</p>
          <div className="h-1.5 rounded-full bg-warm-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${balance ? (balance.sick.used / balance.sick.total) * 100 : 0}%`, background: "#2E7D5B" }}
            />
          </div>
        </button>

        {/* Pending + other */}
        <button onClick={() => router.push("/dashboard/conges?tab=en_attente")} className="bg-white border border-warm-200 rounded-xl p-5 text-left hover:shadow-md transition-shadow cursor-pointer" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#FDF8EE" }}>
              <Clock size={16} color="#947024" aria-hidden="true" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-warm-400">En attente</span>
          </div>
          {balanceLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <p className="font-display text-[32px] font-medium leading-none text-ink-900 mb-1" style={{ letterSpacing: "-0.02em" }}>
              {balance?.pending ?? 0}
            </p>
          )}
          <p className="font-sans text-[12px] text-warm-500 mb-3">
            demande{(balance?.pending ?? 0) !== 1 ? "s" : ""} en cours · {balance?.other.used ?? 0}j autres
          </p>
          <div className="h-1.5 rounded-full bg-warm-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (balance?.pending ?? 0) * 20)}%`, background: "#B4862F" }} />
          </div>
        </button>
      </div>

      {/* ── My requests + Notifications ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* My leave history */}
        <div className="bg-white border border-warm-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #DEDED8" }}>
            <div>
              <p className="font-display text-[15px] font-medium text-ink-900">Mes demandes</p>
              <p className="font-sans text-[12px] text-warm-500 mt-0.5">{myLeaves.length} demande{myLeaves.length !== 1 ? "s" : ""} au total</p>
            </div>
            <button
              onClick={() => setLeaveOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-sans text-[12px] font-semibold cursor-pointer border-none"
              style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729" }}
            >
              <CalendarPlus size={13} aria-hidden="true" /> Nouvelle
            </button>
          </div>

          {leavesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5" style={{ borderBottom: "1px solid #DEDED8" }}>
                <Skeleton className="h-3 w-48 mb-2" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            ))
          ) : myLeaves.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays size={28} className="text-warm-200 mx-auto mb-3" aria-hidden="true" />
              <p className="font-sans text-[13px] text-warm-400">Aucune demande pour le moment.</p>
              <button onClick={() => setLeaveOpen(true)} className="mt-3 font-sans text-[12px] font-semibold cursor-pointer" style={{ color: "#2C3E63" }}>
                Faire une demande →
              </button>
            </div>
          ) : (
            myLeaves.slice(0, 6).map((l, i) => (
              <div
                key={l.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-warm-50 transition-colors"
                style={{ borderBottom: i < Math.min(myLeaves.length, 6) - 1 ? "1px solid #DEDED8" : "none" }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-sans text-[13px] font-semibold text-ink-900">{l.type}</span>
                    <span className="font-mono text-[10px] text-warm-400">· {l.days}j</span>
                  </div>
                  <p className="font-sans text-[11px] text-warm-500">
                    {l.from} → {l.to}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white border border-warm-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #DEDED8" }}>
            <div className="flex items-center gap-2">
              <Bell size={15} color="#76766C" aria-hidden="true" />
              <p className="font-display text-[15px] font-medium text-ink-900">Notifications</p>
            </div>
            <p className="font-sans text-[12px] text-warm-500 mt-0.5">Mises à jour de vos demandes</p>
          </div>

          {notifLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5" style={{ borderBottom: "1px solid #DEDED8" }}>
                <Skeleton className="h-3 w-52 mb-2" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell size={28} className="text-warm-200 mx-auto mb-3" aria-hidden="true" />
              <p className="font-sans text-[13px] text-warm-400">Aucune notification.</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div
                key={n.id}
                className="px-5 py-3.5 flex items-start gap-3 hover:bg-warm-50 transition-colors"
                style={{ borderBottom: i < notifications.length - 1 ? "1px solid #DEDED8" : "none" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: n.status === "approuve" ? "#EDFAF3" : "#FDF3F2" }}
                >
                  {n.status === "approuve"
                    ? <CheckCircle size={15} color="#2E7D5B" aria-hidden="true" />
                    : <XCircle size={15} color="#B4453A" aria-hidden="true" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-[13px] font-medium text-ink-900 leading-snug">
                    Congé {n.type} ({n.days}j){" "}
                    <span
                      className="font-semibold"
                      style={{ color: n.status === "approuve" ? "#2E7D5B" : "#B4453A" }}
                    >
                      {n.status === "approuve" ? "approuvé" : "refusé"}
                    </span>
                  </p>
                  <p className="font-sans text-[11px] text-warm-400 mt-0.5">{n.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Team calendar ────────────────────────────────────── */}
      <div className="bg-white border border-warm-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #DEDED8" }}>
          <div className="flex items-center gap-2">
            <Users size={15} color="#76766C" aria-hidden="true" />
            <div>
              <p className="font-display text-[15px] font-medium text-ink-900">
                Calendrier équipe — {teamData?.dept ?? "–"}
              </p>
              <p className="font-sans text-[12px] text-warm-500 mt-0.5">Collègues absents ce mois · {MONTH}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} color="#76766C" aria-hidden="true" />
            <span className="font-sans text-[12px] text-warm-500">
              {teamData?.leaves?.length ?? 0} absence{(teamData?.leaves?.length ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {teamLoading ? (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-warm-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-2.5 w-36" />
              </div>
            ))}
          </div>
        ) : !teamData?.leaves?.length ? (
          <div className="py-12 text-center">
            <Users size={28} className="text-warm-200 mx-auto mb-3" aria-hidden="true" />
            <p className="font-sans text-[13px] text-warm-400">Toute l'équipe est présente ce mois.</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(teamData?.leaves ?? []).map((m, i) => (
              <div
                key={i}
                className="border border-warm-100 rounded-xl p-3.5 flex items-start gap-3 hover:bg-warm-50 transition-colors"
              >
                <EmpAvatar name={m.employee} size={34} />
                <div className="min-w-0">
                  <p className="font-sans text-[13px] font-semibold text-ink-900 leading-tight truncate">{m.employee}</p>
                  <p className="font-sans text-[11px] text-warm-500 mt-0.5">{m.type} · {m.days}j</p>
                  <p className="font-mono text-[10px] text-warm-400 mt-1">{m.from} → {m.to}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Profile card ──────────────────────────────────────── */}
      <div className="bg-white border border-warm-200 rounded-xl p-5" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
        <p className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500 mb-4">Mon profil</p>
        <div className="flex items-center gap-4">
          <EmpAvatar name={user?.name ?? ""} size={52} />
          <div>
            <p className="font-display text-[18px] font-medium text-ink-900">{profile?.name ?? user?.name ?? "–"}</p>
            <p className="font-sans text-[13px] text-warm-500">{profile?.title ?? "–"}</p>
            <p className="font-sans text-[12px] text-warm-400 mt-0.5">{profile?.email ?? user?.email ?? "–"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-warm-100">
          {[
            { label: "Département", value: profile?.dept ?? "–" },
            { label: "Statut",      value: profile?.status ?? "Actif" },
            { label: "Embauché le", value: profile?.hired ?? "–" },
            { label: "Rôle",        value: profile?.role === "rh" ? "RH" : "Employé" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-warm-400 mb-1">{label}</p>
              <p className="font-sans text-[13px] font-medium text-ink-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <MyLeaveModal open={leaveOpen} onClose={() => setLeaveOpen(false)} />
    </div>
  );
}
