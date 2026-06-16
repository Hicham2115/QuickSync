"use client";

import { useCallback } from "react";
import { FileDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEPARTMENTS_DATA, LEAVES_DATA, EMPLOYEES_DATA } from "@/lib/mock/hr-data";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const HEADCOUNT_DATA = [220, 228, 231, 235, 237, 241, 243, 244, 245, 246, 247, 247].map(
  (v, i) => ({ month: MONTHS[i], effectif: v })
);

const DEPT_DATA = DEPARTMENTS_DATA.map((d) => ({
  name: d.name,
  effectif: d.count,
  actif: d.active,
  fill: d.color,
}));

const leaveTypeMap: Record<string, number> = {};
LEAVES_DATA.forEach((l) => {
  leaveTypeMap[l.type] = (leaveTypeMap[l.type] ?? 0) + l.days;
});
const LEAVE_PIE_DATA = Object.entries(leaveTypeMap).map(([name, value]) => ({ name, value }));
const PIE_COLORS = ["#2C3E63", "#2E7D5B", "#B4862F", "#6B5EA8", "#3C6B8B"];

const statusMap = { Actif: 0, "En congé": 0, Inactif: 0 };
EMPLOYEES_DATA.forEach((e) => { statusMap[e.status] = (statusMap[e.status] ?? 0) + 1; });
const STATUS_PIE_DATA = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
const STATUS_COLORS = ["#2E7D5B", "#B4862F", "#76766C"];

const KPI_TILES = [
  { label: "Effectif total",   value: "247",  delta: "+4 ce mois",   positive: true },
  { label: "Taux de turnover", value: "3.2%", delta: "-0.8% vs N-1", positive: true },
  { label: "Jours d'absence",  value: "48",   delta: "+6 ce mois",   positive: false },
  { label: "Congés approuvés", value: "18",   delta: "ce mois",      positive: true },
];

const headcountConfig: ChartConfig = {
  effectif: { label: "Effectif", color: "#2C3E63" },
};

const deptConfig: ChartConfig = {
  effectif: { label: "Total",  color: "#2C3E63" },
  actif:    { label: "Actifs", color: "#2E7D5B" },
};

export function Rapports() {
  const handleExport = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PAGE_W = 210;
    const MARGIN = 14;
    const COL = PAGE_W - MARGIN * 2;
    const NAVY = [44, 62, 99] as [number, number, number];
    const GREEN = [46, 125, 91] as [number, number, number];
    const GOLD = [180, 134, 47] as [number, number, number];
    const GRAY = [118, 118, 108] as [number, number, number];
    const LIGHT = [245, 244, 242] as [number, number, number];

    const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

    // ── Header banner ──────────────────────────────────────────────
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

    // ── Helper: section title ──────────────────────────────────────
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

    // ── 1. KPIs ────────────────────────────────────────────────────
    sectionTitle("Indicateurs clés (KPI)");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Indicateur", "Valeur", "Variation"]],
      body: KPI_TILES.map((t) => [t.label, t.value, t.delta]),
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 1: { fontStyle: "bold", halign: "center" }, 2: { halign: "center" } },
      theme: "grid",
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;
    gap();

    // ── 2. Headcount trend ─────────────────────────────────────────
    sectionTitle("Évolution de l'effectif (12 derniers mois)");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [MONTHS],
      body: [[220, 228, 231, 235, 237, 241, 243, 244, 245, 246, 247, 247].map(String)],
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 8, halign: "center", textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      theme: "grid",
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;
    gap();

    // ── 3. Departments ─────────────────────────────────────────────
    sectionTitle("Répartition par département");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Département", "Responsable", "Effectif total", "Employés actifs", "Taux d'activité"]],
      body: DEPARTMENTS_DATA.map((d) => [
        d.name,
        d.head,
        d.count,
        d.active,
        `${Math.round((d.active / d.count) * 100)}%`,
      ]),
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: {
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center", textColor: GREEN },
      },
      theme: "grid",
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;
    gap();

    // ── 4. Leaves ─────────────────────────────────────────────────
    if (y > 230) { doc.addPage(); y = 16; }
    sectionTitle("Demandes de congés");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Employé", "Département", "Type", "Du", "Au", "Jours", "Statut"]],
      body: LEAVES_DATA.map((l) => [
        l.employee,
        l.dept,
        l.type,
        l.from,
        l.to,
        l.days,
        l.status === "approuve" ? "Approuvé" : l.status === "refuse" ? "Refusé" : "En attente",
      ]),
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 5: { halign: "center" } },
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === "body") {
          const v = String(data.cell.raw);
          if (v === "Approuvé") data.cell.styles.textColor = GREEN;
          else if (v === "Refusé") data.cell.styles.textColor = [180, 40, 40];
          else data.cell.styles.textColor = GOLD;
        }
      },
      theme: "grid",
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;
    gap();

    // ── 5. Employee roster ─────────────────────────────────────────
    if (y > 200) { doc.addPage(); y = 16; }
    sectionTitle("Liste des employés");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Nom", "Email", "Département", "Poste", "Embauché le", "Statut", "Congés"]],
      body: EMPLOYEES_DATA.map((e) => [e.name, e.email, e.dept, e.title, e.hired, e.status, e.leaves]),
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold" },
      bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: LIGHT },
      columnStyles: { 6: { halign: "center" } },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === "body") {
          const v = String(data.cell.raw);
          if (v === "Actif") data.cell.styles.textColor = GREEN;
          else if (v === "Inactif") data.cell.styles.textColor = GRAY;
          else data.cell.styles.textColor = GOLD;
        }
      },
      theme: "grid",
    });

    // ── Footer on every page ───────────────────────────────────────
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
  }, []);

  return (
    <div className="p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>
            Rapports RH
          </h1>
          <p className="font-sans text-[13px] text-warm-500 mt-0.5">Vue d'ensemble — Juin 2026</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-1.5 font-sans text-[13px] text-warm-500 border-warm-200"
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Exporter tout
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {/* KPI tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPI_TILES.map((t) => (
            <Card key={t.label} className="border-warm-200 shadow-none">
              <CardContent className="pt-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-warm-500 mb-2">{t.label}</p>
                <p className="font-display text-[32px] font-medium leading-none text-ink-900 mb-1.5" style={{ letterSpacing: "-0.02em" }}>
                  {t.value}
                </p>
                <p className={`font-sans text-[12px] font-semibold ${t.positive ? "text-emerald-600" : "text-warm-500"}`}>
                  {t.delta}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Headcount trend — Line chart */}
          <Card className="border-warm-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-[16px] font-medium text-ink-900">
                Évolution de l'effectif
              </CardTitle>
              <CardDescription className="font-sans text-[12px] text-warm-500">
                12 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={headcountConfig} className="h-45 w-full">
                <LineChart data={HEADCOUNT_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#76766C" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#76766C" }} tickLine={false} axisLine={false} domain={[210, 255]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="effectif"
                    stroke="#2C3E63"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#2C3E63" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Dept breakdown — Bar chart */}
          <Card className="border-warm-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-[16px] font-medium text-ink-900">
                Répartition par département
              </CardTitle>
              <CardDescription className="font-sans text-[12px] text-warm-500">
                Effectif total vs actifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={deptConfig} className="h-45 w-full">
                <BarChart data={DEPT_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#76766C" }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#76766C" }} tickLine={false} axisLine={false} width={72} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="effectif" fill="#2C3E63" radius={[0, 3, 3, 0]} barSize={8} />
                  <Bar dataKey="actif" fill="#2E7D5B" radius={[0, 3, 3, 0]} barSize={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Leave types — Pie */}
          <Card className="border-warm-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-[16px] font-medium text-ink-900">
                Congés par type
              </CardTitle>
              <CardDescription className="font-sans text-[12px] text-warm-500">
                Répartition en jours
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer config={{}} className="h-50 w-full max-w-[320px]">
                <PieChart>
                  <Pie
                    data={LEAVE_PIE_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {LEAVE_PIE_DATA.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} j`, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8e5e0" }}
                  />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Employee status — Pie */}
          <Card className="border-warm-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-[16px] font-medium text-ink-900">
                Statuts des employés
              </CardTitle>
              <CardDescription className="font-sans text-[12px] text-warm-500">
                Répartition actuelle
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer config={{}} className="h-50 w-full max-w-[320px]">
                <PieChart>
                  <Pie
                    data={STATUS_PIE_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {STATUS_PIE_DATA.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} employés`, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8e5e0" }}
                  />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Absences per dept — Bar */}
        <Card className="border-warm-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-[16px] font-medium text-ink-900">
              Congés en attente par département
            </CardTitle>
            <CardDescription className="font-sans text-[12px] text-warm-500">
              Demandes non traitées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ jours: { label: "Jours", color: "#B4862F" } }} className="h-40 w-full">
              <BarChart
                data={(() => {
                  const m: Record<string, number> = {};
                  LEAVES_DATA.filter((l) => l.status === "en_attente").forEach(
                    (l) => { m[l.dept] = (m[l.dept] ?? 0) + l.days; }
                  );
                  return Object.entries(m).map(([dept, jours]) => ({ dept, jours }));
                })()}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#76766C" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#76766C" }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="jours" fill="#B4862F" radius={[3, 3, 0, 0]} barSize={28} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
