"use client";
import { useEffect, useRef, useState } from "react";
import { FadeIn } from "./FadeIn";

const REFERENCE_WIDTH = 900;
const REFERENCE_HEIGHT = 540;

const NAV_ITEMS = [
  { label: "Tableau de bord", active: true },
  { label: "Personnel" },
  { label: "Congés" },
  { label: "Départements" },
  { label: "Rapports" },
];

const TILES = [
  { label: "EFFECTIF", value: "247", delta: "↑ +4 ce mois", color: "#2E7D5B" },
  { label: "EN ATTENTE", value: "8", delta: "à traiter", color: "#B4862F" },
  { label: "PRÉSENCE", value: "94.2%", delta: "↑ +1.8%", color: "#2E7D5B" },
  { label: "DÉPARTEMENTS", value: "14", delta: "312 postes", color: "#3C6EA5" },
];

const ROWS = [
  {
    name: "Nadia Benjelloun",
    type: "Annuel",
    period: "10–14 Jun",
    status: "En attente",
    sc: "#B4862F",
    sb: "#FBF1D9",
  },
  {
    name: "Karim El Idrissi",
    type: "Maladie",
    period: "8–9 Jun",
    status: "Approuvé",
    sc: "#2E7D5B",
    sb: "#E4F2EA",
  },
  {
    name: "Salma Ait Ouarab",
    type: "Annuel",
    period: "15–20 Jun",
    status: "Approuvé",
    sc: "#2E7D5B",
    sb: "#E4F2EA",
  },
  {
    name: "Youssef Mansouri",
    type: "Sans solde",
    period: "1–5 Jul",
    status: "Refusé",
    sc: "#B4453A",
    sb: "#F8E5E2",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function DashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(REFERENCE_WIDTH);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(1, containerWidth / REFERENCE_WIDTH);
  const offsetX = (containerWidth - REFERENCE_WIDTH * scale) / 2;

  return (
    <section id="preview" className="py-24 px-6 lg:px-12 bg-warm-25">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="font-mono text-[11px] font-medium tracking-[.16em] uppercase text-gold-500 mb-3.5">
              Aperçu
            </p>
            <h2
              className="font-display font-medium tracking-tight text-ink-900 mb-4"
              style={{ fontSize: "clamp(30px, 4vw, 42px)", lineHeight: 1.08 }}
            >
              Une Interface Pensée Pour La Clarté.
            </h2>
            <p className="text-[17px] text-warm-600 leading-relaxed max-w-lg mx-auto">
              Chaque élément est conçu pour que l&apos;information importante
              soit visible au premier regard.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          {/* Responsive scale container */}
          <div
            ref={containerRef}
            className="w-full"
            style={{ height: `${REFERENCE_HEIGHT * scale}px` }}
          >
            <div style={{ marginLeft: `${offsetX}px` }}>
              <div
                style={{
                  width: REFERENCE_WIDTH,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {/* MacBook wrapper */}
                <div
                  className="flex flex-col items-center"
                  style={{
                    filter: "drop-shadow(0 40px 80px rgba(15,23,41,0.22))",
                  }}
                >
                  {/* Lid — aluminium frame */}
                  <div
                    className="w-full"
                    style={{
                      background:
                        "linear-gradient(180deg, #e4e6e8 0%, #cfd1d3 100%)",
                      borderRadius: "16px 16px 0 0",
                      padding: "8px 8px 0",
                      boxShadow:
                        "inset 0 0 0 1px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,0.55)",
                    }}
                  >
                    {/* Black bezel */}
                    <div
                      className="relative overflow-hidden"
                      style={{
                        background: "#111",
                        borderRadius: "10px 10px 0 0",
                        paddingTop: 22,
                      }}
                    >
                      {/* Camera dot */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                          top: 8,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#2c2c2c",
                          boxShadow: "0 0 0 1px #1a1a1a",
                        }}
                      />
                      {/* Traffic lights */}
                      <div
                        className="absolute left-4 flex items-center gap-1.5"
                        style={{ top: 7 }}
                      >
                        <div
                          style={{
                            width: 11,
                            height: 11,
                            borderRadius: "50%",
                            background: "#FF5F57",
                            boxShadow: "0 0 0 0.5px rgba(0,0,0,0.25)",
                          }}
                        />
                        <div
                          style={{
                            width: 11,
                            height: 11,
                            borderRadius: "50%",
                            background: "#FEBC2E",
                            boxShadow: "0 0 0 0.5px rgba(0,0,0,0.25)",
                          }}
                        />
                        <div
                          style={{
                            width: 11,
                            height: 11,
                            borderRadius: "50%",
                            background: "#28C840",
                            boxShadow: "0 0 0 0.5px rgba(0,0,0,0.25)",
                          }}
                        />
                      </div>

                      {/* Screen */}
                      <div className="flex h-115">
                        {/* Sidebar */}
                        <div className="w-48 bg-ink-800 shrink-0 flex flex-col">
                          <div className="h-13 flex items-center px-4 gap-2 border-b border-white/10">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background:
                                  "linear-gradient(140deg, #CBA24A, #947024)",
                              }}
                            >
                              <span className="font-display text-xs font-bold text-ink-900 leading-none">
                                W
                              </span>
                            </div>
                            <span className="font-display text-sm font-medium text-warm-25">
                              QuickSync
                            </span>
                          </div>
                          <div className="p-2.5 flex-1">
                            {NAV_ITEMS.map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center gap-2 px-2.5 py-2 rounded-md mb-px relative overflow-hidden"
                                style={{
                                  background: item.active
                                    ? "rgba(255,255,255,0.10)"
                                    : "transparent",
                                }}
                              >
                                {item.active && (
                                  <div className="absolute left-0 top-[20%] bottom-[20%] w-0.75 bg-gold-400 rounded-r-[3px]" />
                                )}
                                <div
                                  className="w-3 h-3 rounded-[3px]"
                                  style={{
                                    background: item.active
                                      ? "rgba(255,255,255,0.5)"
                                      : "rgba(255,255,255,0.12)",
                                  }}
                                />
                                <span
                                  className="font-sans text-xs"
                                  style={{
                                    fontWeight: item.active ? 600 : 400,
                                    color: item.active
                                      ? "#fff"
                                      : "rgba(255,255,255,0.45)",
                                  }}
                                >
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 bg-warm-25 flex flex-col overflow-hidden">
                          {/* Topbar */}
                          <div className="h-12 bg-white/90 border-b border-warm-200 flex items-center justify-between px-5 shrink-0">
                            <span className="font-display text-[15px] font-medium text-ink-900">
                              Tableau de bord
                            </span>
                            <div className="flex gap-2 items-center">
                              <div className="w-28 h-6.5 rounded-md bg-warm-50 border border-warm-200 flex items-center px-2 gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-sm bg-warm-300" />
                                <span className="font-sans text-[10px] text-warm-400">
                                  Rechercher...
                                </span>
                              </div>
                              <div
                                className="w-6.5 h-6.5 rounded-full flex items-center justify-center"
                                style={{
                                  background:
                                    "linear-gradient(140deg, #CBA24A, #947024)",
                                }}
                              >
                                <span className="font-sans text-[9px] font-bold text-ink-900">
                                  NB
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="flex-1 p-3.5 px-4.5 overflow-hidden">
                            {/* Stat tiles */}
                            <div className="grid grid-cols-4 gap-2.5 mb-3.5">
                              {TILES.map((tile) => (
                                <div
                                  key={tile.label}
                                  className="bg-white border border-warm-200 rounded-[10px] p-3"
                                >
                                  <div className="font-mono text-[8.5px] tracking-widest text-warm-500 mb-1.5">
                                    {tile.label}
                                  </div>
                                  <div className="font-display text-xl font-medium text-ink-900 leading-none mb-1">
                                    {tile.value}
                                  </div>
                                  <div
                                    className="font-sans text-[10px] font-semibold"
                                    style={{ color: tile.color }}
                                  >
                                    {tile.delta}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Requests table */}
                            <div className="bg-white border border-warm-200 rounded-[10px] overflow-hidden">
                              <div className="border-b border-warm-200 px-3.5 py-2.25 flex justify-between items-center">
                                <span className="font-display text-xs font-medium text-ink-900">
                                  Dernières demandes de congés
                                </span>
                                <span className="font-sans text-[10px] text-ink-400">
                                  Voir tout →
                                </span>
                              </div>
                              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-3.5 py-1.75 border-b border-warm-100">
                                {["EMPLOYÉ", "TYPE", "PÉRIODE", "STATUT"].map(
                                  (h) => (
                                    <span
                                      key={h}
                                      className="font-mono text-[8px] tracking-widest text-warm-400"
                                    >
                                      {h}
                                    </span>
                                  ),
                                )}
                              </div>
                              {ROWS.map((row, i) => (
                                <div
                                  key={row.name}
                                  className="grid grid-cols-[2fr_1fr_1fr_1fr] px-3.5 py-2 items-center"
                                  style={{
                                    borderBottom:
                                      i < ROWS.length - 1
                                        ? "1px solid #F6F6F4"
                                        : "none",
                                  }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-ink-500 flex items-center justify-center shrink-0">
                                      <span className="font-sans text-[7px] font-bold text-white">
                                        {initials(row.name)}
                                      </span>
                                    </div>
                                    <span className="font-sans text-[10px] font-medium text-ink-900 truncate">
                                      {row.name}
                                    </span>
                                  </div>
                                  <span className="font-sans text-[10px] text-warm-600">
                                    {row.type}
                                  </span>
                                  <span className="font-mono text-[9px] text-warm-500">
                                    {row.period}
                                  </span>
                                  <span
                                    className="font-sans text-[9px] font-semibold rounded-full px-1.75 py-0.5 inline-block"
                                    style={{
                                      color: row.sc,
                                      background: row.sb,
                                    }}
                                  >
                                    {row.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hinge */}
                  <div
                    className="w-full"
                    style={{
                      height: 10,
                      background:
                        "linear-gradient(180deg, #b8babb 0%, #a8aaac 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                    }}
                  />
                  {/* Base */}
                  <div
                    style={{
                      width: "105%",
                      height: 18,
                      background:
                        "linear-gradient(180deg, #d0d2d4 0%, #c2c4c6 100%)",
                      borderRadius: "0 0 10px 10px",
                      boxShadow:
                        "inset 0 -1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                  >
                    <div
                      className="mx-auto mt-1"
                      style={{
                        width: 60,
                        height: 8,
                        borderRadius: 4,
                        background: "rgba(0,0,0,0.06)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
