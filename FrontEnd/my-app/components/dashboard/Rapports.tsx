"use client";

import { useCallback } from "react";
import { FileDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";

const PIE_COLORS   = ["#2C3E63", "#2E7D5B", "#B4862F", "#6B5EA8", "#3C6B8B"];
const STATUS_COLORS = ["#2E7D5B", "#B4862F", "#76766C"];

interface ReportsData {
  kpi: {
    total_employees: number;
    pending_leaves: number;
    approved_this_month: number;
    absence_days: number;
  };
  headcount:       { month: string; effectif: number }[];
  departments:     { name: string; head: string; effectif: number; actif: number; color: string }[];
  leave_types:     { name: string; value: number }[];
  statuses:        { name: string; value: number }[];
  pending_by_dept: { dept: string; jours: number }[];
  leaves: {
    employee: string; dept: string; type: string;
    from: string; to: string; days: number; status: string;
  }[];
  employees: {
    name: string; email: string; dept: string;
    title: string; hired: string; status: string; leaves: number;
  }[];
}

const headcountConfig: ChartConfig = {
  effectif: { label: "Effectif", color: "#2C3E63" },
};
const deptConfig: ChartConfig = {
  effectif: { label: "Total",  color: "#2C3E63" },
  actif:    { label: "Actifs", color: "#2E7D5B" },
};

function KpiSkeleton() {
  return (
    <div className="flex flex-col gap-2 pt-5 px-5 pb-5">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function Rapports() {
  const { data, isLoading } = useQuery<ReportsData>({
    queryKey: ["reports"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/reports");
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur de chargement.");
        throw err;
      }
    },
  });

  const handleExport = useCallback(async () => {
    if (!data) return;

    const { default: jsPDF }    = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PAGE_W = 210;
    const MARGIN = 14;
    const COL    = PAGE_W - MARGIN * 2;
    const NAVY   = [44, 62, 99]   as [number, number, number];
    const GREEN  = [46, 125, 91]  as [number, number, number];
    const GOLD   = [180, 134, 47] as [number, number, number];
    const GRAY   = [118, 118, 108]as [number, number, number];
    const LIGHT  = [245, 244, 242]as [number, number, number];

    const today = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
    });

    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PAGE_W, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Rapports RH — Aurea HR", MARGIN, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Généré le ${today}`, MARGIN, 20);
    doc.text("Confidentiel", PAGE_W - MARGIN, 20, { align: "right" });

    let y = 36;

    const sectionTitle = (title: string) => {
      doc.setFillColor(...LIGHT);
      doc.rect(MARGIN, y, COL, 7, "F");
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.6);
      doc.line(MARGIN, y, MARGIN, y + 7);
      doc.setTextColor(...NAVY);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), MARGIN + 3, y + 5);
      y += 10;
    };

    const gap = (n = 5) => { y += n; };

    // 1. KPIs
    sectionTitle("Indicateurs clés (KPI)");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Indicateur", "Valeur"]],
      body: [
        ["Effectif total",           String(data.kpi.total_employees)],
        ["Congés en attente",        String(data.kpi.pending_leaves)],
        ["Congés approuvés ce mois", String(data.kpi.approved_this_month)],
        ["Jours d'absence ce mois",  String(data.kpi.absence_days)],
      ],
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 1: { fontStyle: "bold", halign: "center" } },
      theme: "grid",
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;
    gap();

    // 2. Departments
    sectionTitle("Répartition par département");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Département", "Responsable", "Effectif total", "Employés actifs", "Taux d'activité"]],
      body: data.departments.map((d) => [
        d.name, d.head, d.effectif, d.actif,
        d.effectif > 0 ? `${Math.round((d.actif / d.effectif) * 100)}%` : "–",
      ]),
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center", textColor: GREEN } },
      theme: "grid",
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;
    gap();

    // 3. Leaves
    if (y > 230) { doc.addPage(); y = 16; }
    sectionTitle("Demandes de congés");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Employé", "Département", "Type", "Du", "Au", "Jours", "Statut"]],
      body: data.leaves.map((l) => [
        l.employee, l.dept, l.type, l.from, l.to, l.days,
        l.status === "approuve" ? "Approuvé" : l.status === "refuse" ? "Refusé" : "En attente",
      ]),
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 5: { halign: "center" } },
      didParseCell: (cellData) => {
        if (cellData.column.index === 6 && cellData.section === "body") {
          const v = String(cellData.cell.raw);
          if (v === "Approuvé")   cellData.cell.styles.textColor = GREEN;
          else if (v === "Refusé") cellData.cell.styles.textColor = [180, 40, 40];
          else                     cellData.cell.styles.textColor = GOLD;
        }
      },
      theme: "grid",
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;
    gap();

    // 4. Employees
    if (y > 200) { doc.addPage(); y = 16; }
    sectionTitle("Liste des employés");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Nom", "Email", "Département", "Poste", "Embauché le", "Statut", "Congés"]],
      body: data.employees.map((e) => [e.name, e.email, e.dept, e.title, e.hired, e.status, e.leaves]),
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold" },
      bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 6: { halign: "center" } },
      didParseCell: (cellData) => {
        if (cellData.column.index === 5 && cellData.section === "body") {
          const v = String(cellData.cell.raw);
          if (v === "Actif")       cellData.cell.styles.textColor = GREEN;
          else if (v === "Inactif") cellData.cell.styles.textColor = GRAY;
          else                      cellData.cell.styles.textColor = GOLD;
        }
      },
      theme: "grid",
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, 287, PAGE_W - MARGIN, 287);
      doc.setFontSize(7.5);
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "normal");
      doc.text("Aurea HR — Document confidentiel", MARGIN, 292);
      doc.text(`Page ${i} / ${pageCount}`, PAGE_W - MARGIN, 292, { align: "right" });
    }

    doc.save(`rapports-aurea-hr-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [data]);

  const currentMonth = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const kpiTiles = data
    ? [
        { label: "Effectif total",           value: String(data.kpi.total_employees),    delta: "collaborateurs",      positive: true },
        { label: "Congés en attente",        value: String(data.kpi.pending_leaves),     delta: "à traiter",           positive: data.kpi.pending_leaves === 0 },
        { label: "Jours d'absence ce mois",  value: String(data.kpi.absence_days),       delta: "jours approuvés",     positive: false },
        { label: "Congés approuvés ce mois", value: String(data.kpi.approved_this_month),delta: "demandes approuvées", positive: true },
      ]
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>
            Rapports RH
          </h1>
          <p className="font-sans text-[13px] text-warm-500 mt-0.5 capitalize">
            Vue d'ensemble — {currentMonth}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isLoading || !data}
          className="gap-1.5 font-sans text-[13px] text-warm-500 border-warm-200"
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Exporter tout
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {/* KPI tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-warm-200 shadow-none">
                  <KpiSkeleton />
                </Card>
              ))
            : kpiTiles.map((t) => (
                <Card key={t.label} className="border-warm-200 shadow-none">
                  <CardContent className="pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-warm-500 mb-2">{t.label}</p>
                    <p className="font-display text-[32px] font-medium leading-none text-ink-900 mb-1.5" style={{ letterSpacing: "-0.02em" }}>
                      {t.value}
                    </p>
                    <p className={`font-sans text-[12px] ${t.positive ? "text-emerald-600" : "text-warm-500"}`}>
                      {t.delta}
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Headcount trend */}
          <Card className="border-warm-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-[16px] font-medium text-ink-900">Évolution de l'effectif</CardTitle>
              <CardDescription className="font-sans text-[12px] text-warm-500">12 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-44 w-full rounded-md" /> : (
                <ChartContainer config={headcountConfig} className="h-44 w-full">
                  <LineChart data={data?.headcount ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#76766C" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#76766C" }} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="effectif" stroke="#2C3E63" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#2C3E63" }} />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Dept breakdown */}
          <Card className="border-warm-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-[16px] font-medium text-ink-900">Répartition par département</CardTitle>
              <CardDescription className="font-sans text-[12px] text-warm-500">Effectif total vs actifs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-44 w-full rounded-md" /> : (
                <ChartContainer config={deptConfig} className="h-44 w-full">
                  <BarChart data={data?.departments ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#76766C" }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#76766C" }} tickLine={false} axisLine={false} width={72} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="effectif" fill="#2C3E63" radius={[0, 3, 3, 0]} barSize={8} />
                    <Bar dataKey="actif"    fill="#2E7D5B" radius={[0, 3, 3, 0]} barSize={8} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Leave types pie */}
          <Card className="border-warm-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-[16px] font-medium text-ink-900">Congés par type</CardTitle>
              <CardDescription className="font-sans text-[12px] text-warm-500">Jours approuvés cette année</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isLoading ? <Skeleton className="h-48 w-64 rounded-md" /> : (
                <ChartContainer config={{}} className="h-48 w-full max-w-[320px]">
                  <PieChart>
                    <Pie data={data?.leave_types ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {(data?.leave_types ?? []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} j`, name]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8e5e0" }} />
                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Employee status pie */}
          <Card className="border-warm-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-[16px] font-medium text-ink-900">Statuts des employés</CardTitle>
              <CardDescription className="font-sans text-[12px] text-warm-500">Répartition actuelle</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isLoading ? <Skeleton className="h-48 w-64 rounded-md" /> : (
                <ChartContainer config={{}} className="h-48 w-full max-w-[320px]">
                  <PieChart>
                    <Pie data={data?.statuses ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {(data?.statuses ?? []).map((_, i) => (
                        <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} employés`, name]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8e5e0" }} />
                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending leaves by dept */}
        <Card className="border-warm-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-[16px] font-medium text-ink-900">Congés en attente par département</CardTitle>
            <CardDescription className="font-sans text-[12px] text-warm-500">Demandes non traitées — jours cumulés</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-40 w-full rounded-md" /> : (data?.pending_by_dept ?? []).length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="font-sans text-[13px] text-warm-400">Aucune demande en attente.</p>
              </div>
            ) : (
              <ChartContainer config={{ jours: { label: "Jours", color: "#B4862F" } }} className="h-40 w-full">
                <BarChart data={data?.pending_by_dept ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#76766C" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#76766C" }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="jours" fill="#B4862F" radius={[3, 3, 0, 0]} barSize={28} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
