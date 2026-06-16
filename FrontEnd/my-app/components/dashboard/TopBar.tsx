"use client";
import { usePathname, useRouter } from "next/navigation";
import { Bell, UserRound, LogOut, User } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  "/dashboard/profile":      "Mon profil",
};

export function TopBar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const title     = PAGE_TITLES[pathname] ?? "Tableau de bord";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEmployee = user?.role === "employee";

  const { data: notifData } = useQuery<{ count: number }>({
    queryKey: ["notif-count", user?.role],
    queryFn: async () => {
      try {
        if (isEmployee) {
          const res = await api.get("/api/me/notifications");
          return { count: (res.data as any[]).length };
        } else {
          const res = await api.get("/api/leaves");
          const pending = (res.data as any[]).filter((l: any) => l.status === "en_attente").length;
          return { count: pending };
        }
      } catch {
        return { count: 0 };
      }
    },
    refetchInterval: 30_000,
    enabled: !!user,
  });

  const notifCount = notifData?.count ?? 0;

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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
        {/* Bell */}
        <button
          onClick={() => router.push(isEmployee ? "/dashboard" : "/dashboard/conges")}
          className="relative w-9 h-9 rounded-lg border border-warm-200 bg-transparent flex items-center justify-center cursor-pointer hover:bg-warm-50 transition-colors"
          title={isEmployee ? "Mes notifications" : "Demandes en attente"}
        >
          <Bell size={15} className="text-warm-500" aria-hidden="true" />
          {notifCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-sans text-[9px] font-bold text-white leading-none"
              style={{ background: "#B4453A" }}
            >
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          )}
        </button>

        {/* User avatar + dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
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
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #DEDED8" }}>
                <p className="font-sans text-[13px] font-semibold text-ink-900 truncate">{user?.name ?? "—"}</p>
                <p className="font-sans text-[12px] text-warm-500 truncate mt-0.5">{user?.email ?? "—"}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <DropdownItem
                  icon={<User size={14} aria-hidden="true" />}
                  label="Mon profil"
                  onClick={() => { setDropdownOpen(false); router.push("/dashboard/profile"); }}
                />
                <DropdownItem
                  icon={<Bell size={14} aria-hidden="true" />}
                  label="Notifications"
                  onClick={() => { setDropdownOpen(false); router.push(isEmployee ? "/dashboard" : "/dashboard/conges"); }}
                  badge={notifCount > 0 ? notifCount : undefined}
                />
              </div>

              {/* Logout */}
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
  icon, label, onClick, danger = false, badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  badge?: number;
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
      {badge !== undefined && (
        <span className="font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#B4453A] text-white leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}
