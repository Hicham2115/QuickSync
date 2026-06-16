"use client";
import { usePathname, useRouter } from "next/navigation";
import { Bell, UserRound, LogOut, User, CheckCheck, FileText, ClipboardCheck, Megaphone, AlertTriangle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":              "Tableau de bord",
  "/dashboard/personnel":    "Personnel",
  "/dashboard/conges":       "Congés",
  "/dashboard/departements": "Départements",
  "/dashboard/rapports":     "Rapports",
  "/dashboard/equipe":       "Équipe",
  "/dashboard/presence":     "Présence",
  "/dashboard/documents":    "Documents",
  "/dashboard/annonces":     "Annonces",
  "/dashboard/profile":      "Mon profil",
};

interface NotifItem {
  id: number;
  title: string;
  body: string;
  type: string;
  read: boolean;
  time: string;
}

interface NotifData {
  notifications: NotifItem[];
  unread: number;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "leave_request")    return <FileText size={13} className="text-[#2C3E63]" aria-hidden="true" />;
  if (type === "leave_status")     return <ClipboardCheck size={13} className="text-[#2E7D5B]" aria-hidden="true" />;
  if (type === "document_request" || type === "document_status") return <FileText size={13} style={{ color: "#947024" }} aria-hidden="true" />;
  if (type === "announcement_urgent") return <AlertTriangle size={13} className="text-[#B4453A]" aria-hidden="true" />;
  if (type?.startsWith("announcement_")) return <Megaphone size={13} className="text-[#2C3E63]" aria-hidden="true" />;
  return <Bell size={13} className="text-warm-500" aria-hidden="true" />;
}

export function TopBar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const queryClient = useQueryClient();
  const user      = useAuthStore((s) => s.user);
  const title     = PAGE_TITLES[pathname] ?? "Tableau de bord";

  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [notifOpen,    setNotifOpen]      = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  const { data: notifData } = useQuery<NotifData>({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/me/notifications");
        return res.data;
      } catch {
        return { notifications: [], unread: 0 };
      }
    },
    refetchInterval: 20_000,
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.post("/api/me/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = notifData?.unread ?? 0;
  const notifications = notifData?.notifications ?? [];

  // Open notif panel → mark all read after a short delay
  useEffect(() => {
    if (notifOpen && unread > 0) {
      const t = setTimeout(() => markReadMutation.mutate(), 800);
      return () => clearTimeout(t);
    }
  }, [notifOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current    && !notifRef.current.contains(e.target as Node))    setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const LogoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/logout", {});
      return res.data;
    },
    onSuccess: () => {
      localStorage.removeItem("auth_token");
      toast.success("Vous avez été déconnecté.");
      router.push("/");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erreur lors de la déconnexion.")
        : "Erreur lors de la déconnexion.";
      toast.error(message);
    },
  });

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <header
      className="h-16 flex items-center justify-between px-7 shrink-0 z-30"
      style={{ background: "rgba(251,251,250,.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid #DEDED8" }}
    >
      <span className="font-display text-[20px] font-medium text-ink-900" style={{ letterSpacing: "-0.01em" }}>
        {title}
      </span>

      <div className="flex items-center gap-2">
        {/* Bell + notification dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setDropdownOpen(false); }}
            className="relative w-9 h-9 rounded-lg border border-warm-200 bg-transparent flex items-center justify-center cursor-pointer hover:bg-warm-50 transition-colors"
            title="Notifications"
          >
            <Bell size={15} className="text-warm-500" aria-hidden="true" />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-sans text-[9px] font-bold text-white leading-none"
                style={{ background: "#B4453A" }}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-xl overflow-hidden z-50 flex flex-col"
              style={{ background: "#fff", border: "1px solid #DEDED8", boxShadow: "0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.06)", maxHeight: "420px" }}
            >
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid #DEDED8" }}>
                <div className="flex items-center gap-2">
                  <p className="font-sans text-[13px] font-semibold text-ink-900">Notifications</p>
                  {unread > 0 && (
                    <span className="font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none" style={{ background: "#B4453A", color: "#fff" }}>
                      {unread}
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={() => markReadMutation.mutate()}
                    className="flex items-center gap-1 font-sans text-[11px] text-warm-400 hover:text-ink-700 transition-colors cursor-pointer"
                  >
                    <CheckCheck size={12} aria-hidden="true" /> Tout lire
                  </button>
                )}
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={22} className="text-warm-300 mx-auto mb-2" aria-hidden="true" />
                    <p className="font-sans text-[12px] text-warm-400">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 flex items-start gap-3 transition-colors hover:bg-warm-50"
                      style={{
                        borderBottom: i < notifications.length - 1 ? "1px solid #F0EFE9" : "none",
                        background: n.read ? "transparent" : "rgba(44,62,99,.03)",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: n.type === "leave_request" ? "#EEF2F9" : "#EDFAF3" }}
                      >
                        <NotifIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-sans text-[12px] leading-tight ${n.read ? "text-ink-700" : "font-semibold text-ink-900"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B4453A] shrink-0 mt-1" />
                          )}
                        </div>
                        {n.body && (
                          <p className="font-sans text-[11px] text-warm-500 mt-0.5 leading-relaxed">{n.body}</p>
                        )}
                        <p className="font-mono text-[10px] text-warm-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar + dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => { setDropdownOpen((v) => !v); setNotifOpen(false); }}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
            style={{ background: "linear-gradient(140deg,#CBA24A,#947024)" }}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {initials ? (
              <span className="font-sans text-[12px] font-bold" style={{ color: "#0F1729" }}>{initials}</span>
            ) : (
              <UserRound size={16} style={{ color: "#0F1729" }} aria-hidden="true" />
            )}
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl overflow-hidden z-50"
              style={{ background: "#fff", border: "1px solid #DEDED8", boxShadow: "0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.06)" }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #DEDED8" }}>
                <p className="font-sans text-[13px] font-semibold text-ink-900 truncate">{user?.name ?? "—"}</p>
                <p className="font-sans text-[12px] text-warm-500 truncate mt-0.5">{user?.email ?? "—"}</p>
              </div>

              <div className="py-1">
                <DropdownItem
                  icon={<User size={14} aria-hidden="true" />}
                  label="Mon profil"
                  onClick={() => { setDropdownOpen(false); router.push("/dashboard/profile"); }}
                />
              </div>

              <div className="py-1" style={{ borderTop: "1px solid #DEDED8" }}>
                <DropdownItem
                  icon={<LogOut size={14} aria-hidden="true" />}
                  label="Se déconnecter"
                  danger
                  onClick={() => { setDropdownOpen(false); LogoutMutation.mutate(); }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  icon, label, onClick, danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors cursor-pointer ${
        danger ? "text-[#B4453A] hover:bg-red-50" : "text-ink-700 hover:bg-warm-50"
      }`}
    >
      <span className={danger ? "text-[#B4453A]" : "text-warm-500"}>{icon}</span>
      <span className="font-sans text-[13px] flex-1">{label}</span>
    </button>
  );
}
