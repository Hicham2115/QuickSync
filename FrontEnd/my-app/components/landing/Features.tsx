"use client";
import { useState } from "react";
import {
  Users,
  CalendarDays,
  Building2,
  BarChart3,
  Bell,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FadeIn } from "./FadeIn";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: Users,
    title: "Gestion du personnel",
    desc: "Fiches employés complètes, historique de carrière, documents et contrats centralisés en un clic.",
  },
  {
    icon: CalendarDays,
    title: "Congés Et absences",
    desc: "Demandes de congés en ligne, workflow d'approbation automatisé, calendrier d'équipe en temps réel.",
  },
  {
    icon: Building2,
    title: "Départements Et organigramme",
    desc: "Structure hiérarchique claire, affectations par département, vision globale de l'organisation.",
  },
  {
    icon: BarChart3,
    title: "Rapports Et analytics",
    desc: "Tableaux de bord dynamiques, exports PDF/Excel, indicateurs clés : turnover, absentéisme, masse salariale.",
  },
  {
    icon: Bell,
    title: "Notifications intelligentes",
    desc: "Alertes en temps réel pour les approbations en attente, fins de contrat et anniversaires.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité Et rôles",
    desc: "Contrôle d'accès par rôle (admin, manager, employé), audit log et conformité RGPD.",
  },
];

function FeatureCard({ icon: Icon, title, desc }: Feature) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white border border-warm-200 rounded-2xl p-7 transition-shadow duration-200 h-full"
      style={{
        boxShadow: hovered
          ? "0 8px 24px rgba(15,23,41,.08), 0 2px 6px rgba(15,23,41,.05)"
          : "0 1px 2px rgba(15,23,41,.06)",
      }}
    >
      <div
        className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-5 transition-colors duration-200"
        style={{ background: hovered ? "#FBF7EC" : "#EEF2F9" }}
      >
        <Icon
          aria-hidden="true"
          size={20}
          color={hovered ? "#947024" : "#2C3E63"}
          className="transition-colors duration-200"
        />
      </div>
      <h3 className="font-display text-lg font-medium text-ink-900 mb-2.5">
        {title}
      </h3>
      <p className="text-sm text-warm-600 leading-relaxed">{desc}</p>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 px-6 lg:px-12 bg-warm-25">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="font-mono text-[11px] font-medium tracking-[.16em] uppercase text-gold-500 mb-3.5">
              Fonctionnalités
            </p>
            <h2
              className="font-display font-medium tracking-tight text-ink-900 mb-4"
              style={{ fontSize: "clamp(30px, 4vw, 42px)", lineHeight: 1.08 }}
            >
              Tout Ce Qu&apos;Il Faut Pour Piloter Vos RH.
            </h2>
            <p className="text-[17px] text-warm-600 leading-relaxed max-w-xl mx-auto">
              Des outils pensés pour simplifier le quotidien des responsables RH
              et des collaborateurs.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.07} className="flex">
              <FeatureCard {...feature} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
