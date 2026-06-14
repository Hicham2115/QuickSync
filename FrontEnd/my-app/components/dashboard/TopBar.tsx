"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  UserRound,
  Settings,
  LogOut,
  User,
  HelpCircle,
} from "lucide-react";
import { useHRStore } from "@/lib/store/useHRStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/dashboard/personnel": "Personnel",
  "/dashboard/conges": "Congés",
  "/dashboard/departements": "Départements",
  "/dashboard/rapports": "Rapports",
  "/dashboard/notifications": "Notifications",
  "/dashboard/parametres": "Paramètres",
};

interface UserInfo {
  CompleteName: string;
  email: string;
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? "Tableau de bord";
  const pendingCount = useHRStore(
    (s) => s.leaves.filter((l) => l.status === "en_attente").length,
  );

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const GetUserInfo = useMutation({
    mutationFn: async () => {
      const res = await api.get("/api/user");
      return res.data;
    },
    onSuccess: (response) => {
      setUserInfo(response);
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Une erreur est survenue.")
        : "Une erreur est survenue.";
      toast.error(message);
    },
  });

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
    GetUserInfo.mutate();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const initials = userInfo?.CompleteName
    ? userInfo.CompleteName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <header
      className="h-16 flex items-center justify-between px-7 shrink-0 z-30"
      style={{
        background: "rgba(251,251,250,.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #DEDED8",
      }}
    >
      <span
        className="font-display text-[20px] font-medium text-ink-900"
        style={{ letterSpacing: "-0.01em" }}
      >
        {title}
      </span>
      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 rounded-lg border border-warm-200 bg-transparent flex items-center justify-center cursor-pointer hover:bg-warm-50 transition-colors">
          <Bell size={15} className="text-warm-500" aria-hidden="true" />
          {pendingCount > 0 && (
            <div
              className="absolute top-[7px] right-[7px] w-[7px] h-[7px] rounded-full bg-[#B4453A]"
              style={{ border: "1.5px solid #FBFBFA" }}
            />
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
              <span
                className="font-sans text-[12px] font-bold"
                style={{ color: "#0F1729" }}
              >
                {initials}
              </span>
            ) : (
              <UserRound
                size={16}
                style={{ color: "#0F1729" }}
                aria-hidden="true"
              />
            )}
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl overflow-hidden"
              style={{
                background: "#fff",
                border: "1px solid #DEDED8",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.06)",
              }}
            >
              {/* User info header */}
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid #DEDED8" }}
              >
                <p className="font-sans text-[13px] font-semibold text-ink-900 truncate">
                  {userInfo?.CompleteName ?? "—"}
                </p>
                <p className="font-sans text-[12px] text-warm-500 truncate mt-0.5">
                  {userInfo?.email ?? "—"}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <DropdownItem
                  icon={<User size={14} aria-hidden="true" />}
                  label="Mon profil"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard/parametres");
                  }}
                />
                <DropdownItem
                  icon={<Settings size={14} aria-hidden="true" />}
                  label="Paramètres"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard/parametres");
                  }}
                />
                <DropdownItem
                  icon={<Bell size={14} aria-hidden="true" />}
                  label="Notifications"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard/notifications");
                  }}
                  badge={pendingCount > 0 ? pendingCount : undefined}
                />
                <DropdownItem
                  icon={<HelpCircle size={14} aria-hidden="true" />}
                  label="Aide & support"
                  onClick={() => setDropdownOpen(false)}
                />
              </div>

              {/* Logout */}
              <div className="py-1" style={{ borderTop: "1px solid #DEDED8" }}>
                <DropdownItem
                  icon={<LogOut size={14} aria-hidden="true" />}
                  label="Se déconnecter"
                  danger
                  onClick={() => {
                    setDropdownOpen(false);
                    LogoutMutation.mutate();
                  }}
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
  icon,
  label,
  onClick,
  danger = false,
  badge,
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
        danger
          ? "text-[#B4453A] hover:bg-red-50"
          : "text-ink-700 hover:bg-warm-50"
      }`}
    >
      <span className={danger ? "text-[#B4453A]" : "text-warm-500"}>
        {icon}
      </span>
      <span className="font-sans text-[13px] flex-1">{label}</span>
      {badge !== undefined && (
        <span className="font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#B4453A] text-white leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}
