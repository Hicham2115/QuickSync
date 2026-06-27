"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Building2,
  BarChart3,
  ChevronUp,
  LogOut,
  UsersRound,
  ClipboardCheck,
  UserRound,
  FileText,
  Megaphone,
  GraduationCap,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { useAuthStore, type UserRole } from "@/lib/store/useAuthStore";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles: UserRole[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const ALL_NAV_GROUPS: NavGroup[] = [
  {
    label: "PRINCIPAL",
    items: [
      { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard",              roles: ["admin", "rh", "employee"] },
      { icon: Users,           label: "Personnel",       href: "/dashboard/personnel",    roles: ["admin", "rh"] },
      { icon: CalendarDays,    label: "Congés",          href: "/dashboard/conges",       roles: ["admin", "rh", "employee"] },
      { icon: ClipboardCheck,  label: "Présence",        href: "/dashboard/presence",     roles: ["admin", "rh", "employee"] },
      { icon: Building2,       label: "Départements",    href: "/dashboard/departements", roles: ["admin", "rh"] },
      { icon: Megaphone,       label: "Annonces",        href: "/dashboard/annonces",     roles: ["admin", "rh", "employee"] },
      { icon: FileText,        label: "Documents",       href: "/dashboard/documents",    roles: ["admin", "rh", "employee"] },
      { icon: GraduationCap,  label: "Formations",      href: "/dashboard/formations",   roles: ["admin", "rh"] },
      { icon: MessageSquare,  label: "Messagerie",      href: "/dashboard/messages",     roles: ["admin", "rh", "employee"] },
    ],
  },
  {
    label: "OUTILS",
    items: [
      { icon: BarChart3,  label: "Rapports", href: "/dashboard/rapports", roles: ["admin", "rh"] },
      { icon: UsersRound, label: "Equipe",   href: "/dashboard/equipe",   roles: ["admin"] },
    ],
  },
];

const ROLE_LABEL: Record<UserRole, string> = {
  admin:    "Administrateur",
  rh:       "Ressources Humaines",
  employee: "Employé",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "rh";

  const navGroups = ALL_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const logoutMutation = useMutation({
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
        ? (error.response?.data?.message ?? "Échec de la déconnexion.")
        : "Échec de la déconnexion.";
      toast.error(message);
    },
  });

  const initials = user?.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() ?? "–";

  function SidebarBtn({
    onClick,
    children,
    danger = false,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    danger?: boolean;
  }) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left font-sans text-[13px] bg-transparent border-none cursor-pointer transition-colors"
        style={{ color: danger ? "#B4453A" : "#fff" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = danger ? "rgba(180,69,58,.1)" : "rgba(255,255,255,.07)";
        }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        {children}
      </button>
    );
  }

  return (
    <aside className="w-64 flex flex-col h-screen shrink-0" style={{ background: "#131B2C" }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(140deg,#CBA24A,#947024)" }}
        >
          <span className="font-display text-[18px] font-semibold leading-none" style={{ color: "#0F1729" }}>W</span>
        </div>
        <span className="font-display text-[17px] font-medium text-white" style={{ letterSpacing: "-0.01em" }}>
          QuickSync
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p
              className="font-mono text-[10px] uppercase mb-1.5 pl-2"
              style={{ letterSpacing: ".12em", color: "rgba(255,255,255,.28)" }}
            >
              {group.label}
            </p>
            {group.items.map(({ icon: Icon, label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 relative no-underline transition-colors duration-150"
                  style={{ background: active ? "rgba(255,255,255,.1)" : undefined }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = ""; }}
                >
                  {active && (
                    <div
                      className="absolute left-0 top-[20%] bottom-[20%] w-0.75 rounded-r-[3px]"
                      style={{ background: "#CBA24A" }}
                    />
                  )}
                  <Icon size={15} color={active ? "#fff" : "rgba(255,255,255,.45)"} />
                  <span
                    className="font-sans text-[13px]"
                    style={{ fontWeight: active ? 600 : 400, color: active ? "#fff" : "rgba(255,255,255,.58)" }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-3 relative" style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}>
        {menuOpen && (
          <div
            className="absolute bottom-[calc(100%+4px)] left-3 right-3 rounded-[10px] overflow-hidden z-50"
            style={{ background: "#1A253C", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 8px 24px rgba(0,0,0,.35)" }}
          >
            <SidebarBtn onClick={() => { router.push("/dashboard/profile"); setMenuOpen(false); }}>
              <UserRound size={13} /> Mon profil
            </SidebarBtn>
            <div style={{ height: 1, background: "rgba(255,255,255,.08)" }} />
            <SidebarBtn danger onClick={() => { logoutMutation.mutate(); setMenuOpen(false); }}>
              <LogOut size={13} /> Se déconnecter
            </SidebarBtn>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-transparent border-none cursor-pointer"
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(140deg,#CBA24A,#947024)" }}
          >
            <span className="font-sans text-[13px] font-bold" style={{ color: "#0F1729" }}>{initials}</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-sans text-[13px] font-semibold text-white truncate">{user?.name ?? "–"}</p>
            <p className="font-sans text-[11px]" style={{ color: "rgba(255,255,255,.4)" }}>
              {ROLE_LABEL[role]}
            </p>
          </div>
          <ChevronUp
            size={13}
            color="rgba(255,255,255,.4)"
            style={{ transform: menuOpen ? "none" : "rotate(180deg)", transition: "transform .2s", flexShrink: 0 }}
          />
        </button>
      </div>
    </aside>
  );
}
