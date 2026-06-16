"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import {
  ClipboardCheck, Clock, CheckCircle, Calendar,
  ChevronLeft, ChevronRight, TrendingUp, Users, Sun,
  Coffee, LogOut, Timer, Hourglass,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { EmpAvatar } from "./shared/EmpAvatar";
import { Skeleton } from "@/components/ui/skeleton";

/* ── types ───────────────────────────────────────────── */
interface AttendanceRecord {
  id: number;
  employee_name: string;
  dept: string;
  date: string;
  date_label: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  break_started_at: string | null;
  break_minutes: number;
  worked_minutes: number | null;
  status: "working" | "on_break" | "done" | "not_checked_in";
  note: string | null;
}

interface MyAttendanceData {
  today: AttendanceRecord | null;
  records: AttendanceRecord[];
}

/* ── helpers ─────────────────────────────────────────── */
function pad(n: number) { return String(n).padStart(2, "0"); }

const nowDate    = new Date();
const TODAY_YMD  = `${nowDate.getFullYear()}-${pad(nowDate.getMonth() + 1)}-${pad(nowDate.getDate())}`;
const CURRENT_YM = `${nowDate.getFullYear()}-${pad(nowDate.getMonth() + 1)}`;

function ymLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
function prevYM(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function nextYM(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function workingDaysElapsed(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  const isCurrentMonth = ym === CURRENT_YM;
  const lastDay = isCurrentMonth ? nowDate.getDate() : new Date(y, m, 0).getDate();
  let count = 0;
  for (let d = 1; d <= lastDay; d++) {
    const day = new Date(y, m - 1, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}
function daysInMonth(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function firstWeekday(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return (new Date(y, m - 1, 1).getDay() + 6) % 7;
}

function fmtMinutes(m: number): string {
  const total = Math.round(m);
  const h = Math.floor(total / 60);
  const min = total % 60;
  if (total === 0) return "0min";
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}min`;
}

function minutesSince(hhmm: string | null): number {
  if (!hhmm) return 0;
  const [h, mi] = hhmm.split(":").map(Number);
  const ref = new Date();
  ref.setHours(h, mi, 0, 0);
  return Math.max(0, Math.floor((Date.now() - ref.getTime()) / 60000));
}

function useMinuteTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return tick;
}

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

/* ── Calendar ────────────────────────────────────────── */
function CalendarGrid({ ym, presentDates }: { ym: string; presentDates: Set<string> }) {
  const [y, m] = ym.split("-").map(Number);
  const total  = daysInMonth(ym);
  const offset = firstWeekday(ym);
  const isCurrent = ym === CURRENT_YM;
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d, i) => (
          <div key={i} className="text-center font-mono text-[9px] uppercase tracking-widest py-1" style={{ color: i >= 5 ? "#C5C5BE" : "#76766C" }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ymd       = `${y}-${pad(m)}-${pad(day)}`;
          const isToday   = isCurrent && ymd === TODAY_YMD;
          const isPresent = presentDates.has(ymd);
          const isFuture  = isCurrent && ymd > TODAY_YMD;
          const isWeekend = i % 7 >= 5;
          return (
            <div
              key={i}
              className="flex items-center justify-center rounded-lg aspect-square"
              style={{
                background: isPresent ? "#2E7D5B" : isToday ? "#EEF2F9" : "transparent",
                border: isToday && !isPresent ? "1.5px solid #2C3E63" : "none",
                opacity: isFuture || isWeekend ? 0.3 : 1,
              }}
            >
              <span className="font-sans text-[11px] font-medium leading-none" style={{ color: isPresent ? "#fff" : isToday ? "#2C3E63" : "#76766C" }}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid #DEDED8" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "#2E7D5B" }} />
          <span className="font-sans text-[11px] text-warm-500">Présent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-[#2C3E63]" style={{ background: "#EEF2F9" }} />
          <span className="font-sans text-[11px] text-warm-500">Aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}

/* ── Employee view ───────────────────────────────────── */
function EmployeePresence() {
  const queryClient = useQueryClient();
  const user        = useAuthStore((s) => s.user);
  const tick        = useMinuteTick();

  const [ym, setYm]           = useState(CURRENT_YM);
  const [note, setNote]       = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const { data, isLoading } = useQuery<MyAttendanceData>({
    queryKey: ["my-attendance", ym],
    queryFn: async () => {
      try { return (await api.get(`/api/me/attendance?month=${ym}`)).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
  });

  function applyRecord(res: { attendance: AttendanceRecord; message?: string }) {
    const record = res.attendance;
    queryClient.setQueryData<MyAttendanceData>(["my-attendance", ym], (old) => {
      const prev = old ?? { today: null, records: [] };
      const records = prev.records.map((r) => r.id === record.id ? record : r);
      if (!records.some((r) => r.id === record.id)) records.unshift(record);
      return { today: record, records };
    });
    queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
  }

  const checkInMutation = useMutation({
    mutationFn: async () => {
      try { return (await api.post("/api/me/attendance", { note: note.trim() || null })).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: (res) => {
      applyRecord(res);
      toast.success(res.message ?? "Présence enregistrée !");
      setNote(""); setNoteOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      try { return (await api.post("/api/me/attendance/checkout")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: (res) => {
      applyRecord(res);
      toast.success(res.message ?? "Sortie enregistrée !");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const breakStartMutation = useMutation({
    mutationFn: async () => {
      try { return (await api.post("/api/me/attendance/break-start")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: (res) => {
      applyRecord(res);
      toast.success(res.message ?? "Pause commencée.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const breakEndMutation = useMutation({
    mutationFn: async () => {
      try { return (await api.post("/api/me/attendance/break-end")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    onSuccess: (res) => {
      applyRecord(res);
      toast.success(res.message ?? "Pause terminée.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const todayRecord = data?.today ?? null;
  const allRecords = useMemo<AttendanceRecord[]>(() => {
    const records = data?.records ?? [];
    if (!todayRecord) return records;
    if (records.some((r) => r.id === todayRecord.id)) return records.map((r) => r.id === todayRecord.id ? todayRecord : r);
    return [todayRecord, ...records];
  }, [data?.records, todayRecord]);

  const presentDates = useMemo(() => new Set(allRecords.map((r) => r.date)), [allRecords]);
  const presentCount = allRecords.length;
  const workDays     = workingDaysElapsed(ym);
  const rate         = workDays > 0 ? Math.round((presentCount / workDays) * 100) : 0;

  // Live elapsed time (re-computes every 30s via tick)
  const elapsedWorking = useMemo(() => {
    if (!todayRecord || todayRecord.status === "done" || todayRecord.status === "not_checked_in") return 0;
    void tick;
    const total = minutesSince(todayRecord.checked_in_at);
    const breakMins = todayRecord.break_minutes + (todayRecord.status === "on_break" ? minutesSince(todayRecord.break_started_at) : 0);
    return Math.max(0, total - breakMins);
  }, [todayRecord, tick]);

  const elapsedBreak = useMemo(() => {
    if (!todayRecord || todayRecord.status !== "on_break") return 0;
    void tick;
    return minutesSince(todayRecord.break_started_at);
  }, [todayRecord, tick]);

  const isPending = checkInMutation.isPending || checkOutMutation.isPending || breakStartMutation.isPending || breakEndMutation.isPending;

  const todayFR = nowDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-5">

      {/* ── Hero card ─────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1A253C 0%,#2C3E63 100%)" }}>
        <div className="px-6 pt-6 pb-5">
          <p className="font-sans text-[11px] text-white/40 uppercase tracking-widest mb-3">{todayFR}</p>

          {/* NOT CHECKED IN */}
          {!todayRecord && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sun size={18} color="#CBA24A" aria-hidden="true" />
                <h2 className="font-display text-[22px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
                  Bonjour, {user?.name?.split(" ")[0] ?? "—"}
                </h2>
              </div>
              <p className="font-sans text-[13px] text-white/50 mb-4">Vous n'avez pas encore pointé aujourd'hui.</p>

              {noteOpen && (
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ajouter une note (optionnel)…"
                  className="w-full px-3.5 py-2.5 rounded-lg font-sans text-[13px] text-ink-900 outline-none border-none bg-white/90 mb-3"
                />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => checkInMutation.mutate()}
                  disabled={isPending || isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 12px rgba(180,134,47,.35)" }}
                >
                  <ClipboardCheck size={15} aria-hidden="true" />
                  {checkInMutation.isPending ? "Pointage…" : "Pointer l'arrivée"}
                </button>
                <button
                  type="button"
                  onClick={() => setNoteOpen((v) => !v)}
                  className="px-3.5 py-2.5 rounded-xl font-sans text-[13px] text-white/60 border border-white/15 hover:bg-white/10 hover:text-white/80 transition-colors cursor-pointer"
                >
                  {noteOpen ? "Sans note" : "+ Note"}
                </button>
              </div>
            </div>
          )}

          {/* WORKING */}
          {todayRecord?.status === "working" && (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={18} color="#6EE0A8" aria-hidden="true" />
                    <h2 className="font-display text-[22px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>En travail</h2>
                  </div>
                  <p className="font-sans text-[13px] text-white/60">
                    Arrivée : <span className="font-bold text-white/90">{todayRecord.checked_in_at}</span>
                    {todayRecord.note && <span className="text-white/40"> · {todayRecord.note}</span>}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Timer size={13} color="#6EE0A8" aria-hidden="true" />
                    <span className="font-mono text-[13px] font-semibold text-[#6EE0A8]">{fmtMinutes(elapsedWorking)}</span>
                    <span className="font-sans text-[11px] text-white/40">travaillé</span>
                    {todayRecord.break_minutes > 0 && (
                      <span className="font-sans text-[11px] text-white/35 ml-1">· {fmtMinutes(todayRecord.break_minutes)} pause</span>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(46,125,91,.25)" }}>
                  <CheckCircle size={22} color="#6EE0A8" aria-hidden="true" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => breakStartMutation.mutate()}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-[13px] font-medium border border-white/20 text-white/80 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Coffee size={14} aria-hidden="true" />
                  {breakStartMutation.isPending ? "…" : "Pause"}
                </button>
                <button
                  onClick={() => checkOutMutation.mutate()}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 12px rgba(180,134,47,.35)" }}
                >
                  <LogOut size={14} aria-hidden="true" />
                  {checkOutMutation.isPending ? "…" : "Pointer la sortie"}
                </button>
              </div>
            </div>
          )}

          {/* ON BREAK */}
          {todayRecord?.status === "on_break" && (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Coffee size={18} color="#CBA24A" aria-hidden="true" />
                    <h2 className="font-display text-[22px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>En pause</h2>
                  </div>
                  <p className="font-sans text-[13px] text-white/60">
                    Pause commencée à <span className="font-bold text-white/90">{todayRecord.break_started_at}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Hourglass size={13} color="#CBA24A" aria-hidden="true" />
                    <span className="font-mono text-[13px] font-semibold text-[#CBA24A]">{fmtMinutes(elapsedBreak)}</span>
                    <span className="font-sans text-[11px] text-white/40">en pause</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(203,162,74,.2)" }}>
                  <Coffee size={22} color="#CBA24A" aria-hidden="true" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => breakEndMutation.mutate()}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-[13px] font-bold border-none cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(140deg,#CBA24A,#947024)", color: "#0F1729", boxShadow: "0 2px 12px rgba(180,134,47,.35)" }}
                >
                  <CheckCircle size={14} aria-hidden="true" />
                  {breakEndMutation.isPending ? "…" : "Reprendre le travail"}
                </button>
                <button
                  onClick={() => checkOutMutation.mutate()}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-[13px] font-medium border border-white/20 text-white/80 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <LogOut size={14} aria-hidden="true" />
                  {checkOutMutation.isPending ? "…" : "Pointer la sortie"}
                </button>
              </div>
            </div>
          )}

          {/* DONE */}
          {todayRecord?.status === "done" && (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={18} color="#6EE0A8" aria-hidden="true" />
                  <h2 className="font-display text-[22px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>Journée terminée</h2>
                </div>
                <p className="font-sans text-[13px] text-white/60">
                  Arrivée <span className="font-bold text-white/90">{todayRecord.checked_in_at}</span>
                  {" → "}
                  Sortie <span className="font-bold text-white/90">{todayRecord.checked_out_at}</span>
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Timer size={13} color="#6EE0A8" aria-hidden="true" />
                    <span className="font-mono text-[14px] font-bold text-[#6EE0A8]">
                      {todayRecord.worked_minutes != null ? fmtMinutes(todayRecord.worked_minutes) : "–"}
                    </span>
                    <span className="font-sans text-[11px] text-white/40">travaillé</span>
                  </div>
                  {todayRecord.break_minutes > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Coffee size={12} color="rgba(255,255,255,.4)" aria-hidden="true" />
                      <span className="font-sans text-[11px] text-white/40">{fmtMinutes(todayRecord.break_minutes)} pause</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(46,125,91,.25)" }}>
                <CheckCircle size={22} color="#6EE0A8" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ background: "rgba(255,255,255,.07)", padding: "10px 24px" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/35">Taux ce mois</span>
            <span className="font-sans text-[12px] font-semibold text-white/70">{rate}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.1)" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${rate}%`, background: "linear-gradient(90deg,#CBA24A,#6EE0A8)" }} />
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <ClipboardCheck size={15} aria-hidden="true" />, label: "Jours présent", value: presentCount, color: "#2C3E63", bg: "#EEF2F9" },
          { icon: <Calendar size={15} aria-hidden="true" />,       label: "Jours ouvrés",  value: workDays,     color: "#4A7C6B", bg: "#EDFAF3" },
          { icon: <TrendingUp size={15} aria-hidden="true" />,     label: "Taux",          value: `${rate}%`,   color: "#947024", bg: "#FDF8EE" },
        ].map(({ icon, label, value, color, bg }) => (
          <div key={label} className="bg-white border border-warm-200 rounded-xl p-4" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: bg, color }}>{icon}</div>
            <p className="font-display text-[26px] font-medium leading-none mb-1" style={{ color, letterSpacing: "-0.02em" }}>{value}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-warm-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Calendar + History ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Calendar */}
        <div className="bg-white border border-warm-200 rounded-xl p-5" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-[15px] font-medium text-ink-900 capitalize">{ymLabel(ym)}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setYm(prevYM(ym))} className="w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer">
                <ChevronLeft size={14} aria-hidden="true" />
              </button>
              <button onClick={() => setYm(nextYM(ym))} disabled={ym >= CURRENT_YM} className="w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer disabled:opacity-30">
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg flex items-center justify-center">
                  <Skeleton className="w-6 h-6 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <CalendarGrid ym={ym} presentDates={presentDates} />
          )}
        </div>

        {/* History */}
        <div className="bg-white border border-warm-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #DEDED8" }}>
            <p className="font-display text-[15px] font-medium text-ink-900">Historique</p>
            <p className="font-sans text-[12px] text-warm-500 mt-0.5">{presentCount} jour{presentCount !== 1 ? "s" : ""} ce mois</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid #DEDED8" }}>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : allRecords.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar size={26} className="text-warm-200 mx-auto mb-2" aria-hidden="true" />
                <p className="font-sans text-[13px] text-warm-400">Aucune présence ce mois.</p>
              </div>
            ) : (
              allRecords.map((r, i, arr) => (
                <div
                  key={r.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-warm-50 transition-colors"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid #DEDED8" : "none" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: r.status === "done" ? "#EDFAF3" : r.status === "on_break" ? "#FDF8EE" : "#EEF2F9" }}>
                      {r.status === "on_break"
                        ? <Coffee size={13} color="#947024" aria-hidden="true" />
                        : r.status === "done"
                        ? <CheckCircle size={13} color="#2E7D5B" aria-hidden="true" />
                        : <Clock size={13} color="#2C3E63" aria-hidden="true" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] font-medium text-ink-900 capitalize truncate">{r.date_label}</p>
                      {r.note && <p className="font-sans text-[11px] text-warm-400 truncate">{r.note}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-0.5">
                    <div className="flex items-center gap-1 text-warm-400">
                      <Clock size={10} aria-hidden="true" />
                      <span className="font-mono text-[11px] text-ink-700">{r.checked_in_at}</span>
                      {r.checked_out_at && <><span className="text-warm-300">→</span><span className="font-mono text-[11px] text-ink-700">{r.checked_out_at}</span></>}
                    </div>
                    {r.worked_minutes != null && (
                      <span className="font-mono text-[10px] font-semibold" style={{ color: "#2E7D5B" }}>
                        {fmtMinutes(r.worked_minutes)}
                      </span>
                    )}
                    {r.status === "working" && (
                      <span className="font-mono text-[10px]" style={{ color: "#2C3E63" }}>en cours</span>
                    )}
                    {r.status === "on_break" && (
                      <span className="font-mono text-[10px]" style={{ color: "#947024" }}>en pause</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── HR / Admin view ─────────────────────────────────── */
function AdminPresence() {
  const [date, setDate] = useState(TODAY_YMD);

  const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["all-attendance", date],
    queryFn: async () => {
      try { return (await api.get(`/api/attendance?date=${date}`)).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    refetchInterval: 60_000,
  });

  const displayDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
  const isToday = date === TODAY_YMD;

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-5">
      <div className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ background: "linear-gradient(135deg,#1A253C 0%,#2C3E63 100%)" }}>
        <div>
          <p className="font-sans text-[11px] text-white/40 uppercase tracking-widest mb-2">Présence — Suivi</p>
          <h2 className="font-display text-[22px] font-semibold text-white capitalize" style={{ letterSpacing: "-0.02em" }}>{displayDate}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <Users size={14} color="rgba(255,255,255,.5)" aria-hidden="true" />
            <p className="font-sans text-[13px] text-white/60">
              <span className="font-bold text-white/90">{records.length}</span>{" "}
              employé{records.length !== 1 ? "s" : ""} présent{records.length !== 1 ? "s" : ""}
              {isToday && " aujourd'hui"}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <label className="font-mono text-[9px] uppercase tracking-widest text-white/35 block mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            max={TODAY_YMD}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-white/20 bg-white/10 font-sans text-[13px] text-white outline-none cursor-pointer focus:border-white/40 transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-warm-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}>
        <div className="hidden sm:grid px-5 py-3 bg-warm-50" style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr", borderBottom: "1px solid #DEDED8" }}>
          {["EMPLOYÉ", "DÉPARTEMENT", "ARRIVÉE", "SORTIE", "TRAVAILLÉ"].map((h) => (
            <span key={h} className="font-mono text-[9.5px] uppercase tracking-widest text-warm-500">{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-3" style={{ borderBottom: "1px solid #DEDED8" }}>
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1"><Skeleton className="h-3 w-36" /><Skeleton className="h-2.5 w-24" /></div>
              <Skeleton className="h-3 w-12 shrink-0" />
            </div>
          ))
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#F0F2F7" }}>
              <ClipboardCheck size={22} color="#76766C" aria-hidden="true" />
            </div>
            <p className="font-display text-[16px] font-medium text-warm-400 mb-1">Aucune présence</p>
            <p className="font-sans text-[13px] text-warm-400">
              {isToday ? "Personne n'a encore pointé aujourd'hui." : "Aucun pointage ce jour-là."}
            </p>
          </div>
        ) : (
          records.map((r, i) => (
            <div
              key={r.id}
              className="px-5 py-3.5 hover:bg-warm-50 transition-colors"
              style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr", alignItems: "center", gap: "8px", borderBottom: i < records.length - 1 ? "1px solid #DEDED8" : "none" }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <EmpAvatar name={r.employee_name} size={36} />
                <div className="min-w-0">
                  <p className="font-sans text-[13px] font-semibold text-ink-900 truncate">{r.employee_name}</p>
                  {r.note && <p className="font-sans text-[11px] text-warm-400 truncate">{r.note}</p>}
                </div>
              </div>
              <div>
                {r.dept ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full font-sans text-[11px] font-medium" style={{ background: "#EEF2F9", color: "#2C3E63" }}>{r.dept}</span>
                ) : <span className="font-sans text-[12px] text-warm-300">–</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "#EDFAF3" }}>
                  <Clock size={11} color="#2E7D5B" aria-hidden="true" />
                </div>
                <span className="font-mono text-[13px] font-semibold text-ink-900">{r.checked_in_at}</span>
              </div>
              <div>
                {r.checked_out_at ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "#FDF8EE" }}>
                      <LogOut size={11} color="#947024" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-[13px] font-semibold text-ink-900">{r.checked_out_at}</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 font-sans text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: r.status === "on_break" ? "#FDF8EE" : "#EDFAF3", color: r.status === "on_break" ? "#947024" : "#2E7D5B" }}>
                    {r.status === "on_break" ? "Pause" : "En cours"}
                  </span>
                )}
              </div>
              <div>
                {r.worked_minutes != null ? (
                  <span className="font-mono text-[12px] font-semibold" style={{ color: "#2E7D5B" }}>{fmtMinutes(r.worked_minutes)}</span>
                ) : <span className="font-sans text-[12px] text-warm-300">–</span>}
              </div>
            </div>
          ))
        )}

        {!isLoading && records.length > 0 && (
          <div className="px-5 py-3 bg-warm-50" style={{ borderTop: "1px solid #DEDED8" }}>
            <p className="font-sans text-[12px] text-warm-500">{records.length} présence{records.length !== 1 ? "s" : ""} enregistrée{records.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Export ──────────────────────────────────────────── */
export function Presence() {
  const role = useAuthStore((s) => s.user?.role ?? "employee");
  return role === "employee" ? <EmployeePresence /> : <AdminPresence />;
}
