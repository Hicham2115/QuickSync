"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Sparkles, Play, CalendarDays, Check } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";

const STATS = [
  { value: "248+", label: "Employés gérés" },
  { value: "99.9%", label: "Disponibilité" },
  { value: "4.9/5", label: "Satisfaction" },
];

export function Hero({ animate = false }: { animate?: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const openSignUp = useAppStore((s) => s.openSignUp);

  // Set everything invisible immediately (hidden behind loading screen)
  useGSAP(
    () => {
      gsap.set(".h-badge", { opacity: 0, y: -14 });
      gsap.set(".h-line", { opacity: 0, yPercent: 110 });
      gsap.set(".h-para", { opacity: 0, y: 22 });
      gsap.set(".h-cta", { opacity: 0, y: 18 });
      gsap.set(".h-stat", { opacity: 0, y: 14 });
      gsap.set(".h-card", { opacity: 0, x: 50, scale: 0.96 });
      gsap.set(".h-float", { opacity: 0, y: -18, scale: 0.88 });
    },
    { scope: heroRef },
  );

  // Play entrance when loading screen finishes
  useGSAP(
    () => {
      if (!animate) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(".h-badge", {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "back.out(1.6)",
      })
        .to(
          ".h-line",
          { opacity: 1, yPercent: 0, duration: 0.7, stagger: 0.14 },
          "-=0.2",
        )
        .to(".h-para", { opacity: 1, y: 0, duration: 0.6 }, "-=0.45")
        .to(
          ".h-cta",
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          "-=0.35",
        )
        .to(
          ".h-stat",
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
          "-=0.25",
        )
        .to(
          ".h-card",
          { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "power2.out" },
          "-=0.85",
        )
        .to(
          ".h-float",
          { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "back.out(1.8)" },
          "-=0.55",
        );

      // Continuous float on the card after entrance
      const floatTween = gsap.to(".h-card", {
        y: -10,
        duration: 3.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.2,
      });

      // Glow pulse
      const glowTween = gsap.to(".h-glow", {
        opacity: 0.55,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      return () => {
        tl.kill();
        floatTween.kill();
        glowTween.kill();
      };
    },
    { scope: heroRef, dependencies: [animate] },
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center px-6 lg:px-16 pt-28 pb-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, #0F1729 0%, #131B2C 55%, #1A253C 100%)",
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 72%)",
        }}
      />
      {/* Gold glow (pulsing) */}
      <div
        className="h-glow absolute pointer-events-none"
        style={{
          top: "-5%",
          right: "-5%",
          width: "55%",
          height: "60%",
          background:
            "radial-gradient(ellipse at 80% 15%, rgba(203,162,74,0.22) 0%, transparent 55%)",
          opacity: 0.8,
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-30 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, #0F1729)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <div>
          {/* Badge */}
          <div className="h-badge inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full bg-gold-400/12 border border-gold-400/25">
            <span className="font-mono text-[11px] font-medium tracking-[.16em] uppercase text-gold-400">
              Plateforme RH Nouvelle Génération
            </span>
          </div>

          {/* Headline — overflow-hidden wrappers create a slide-up reveal */}
          <h1
            className="font-display font-medium text-white tracking-tight leading-[1.02] mb-6"
            style={{ fontSize: "clamp(40px, 5vw, 62px)" }}
          >
            <div className="overflow-hidden">
              <span className="h-line block">Gérez vos talents avec</span>
            </div>
            <div className="overflow-hidden">
              <span className="h-line block">
                <em className="italic text-gold-300">élégance</em> et précision.
              </span>
            </div>
          </h1>

          <p className="h-para font-sans text-lg leading-[1.65] text-white/62 max-w-md mb-11">
            Une plateforme intuitive pour le suivi du personnel, la gestion des
            congés et l&apos;analyse RH — conçue pour les équipes modernes.
          </p>

          <div className="flex items-center gap-4 mb-16 flex-wrap">
            <button
              onClick={openSignUp}
              className="h-cta inline-flex items-center gap-2 px-8 py-3.75 rounded-[10px] text-[15px] font-bold font-sans text-ink-900 transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(140deg, #CBA24A, #947024)",
                boxShadow: "0 8px 24px rgba(180,134,47,.38)",
              }}
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Démarrer — c&apos;est gratuit
            </button>
            <a
              href="#preview"
              className="h-cta inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] text-[15px] font-semibold font-sans text-white/85 border border-white/20 bg-white/5 hover:bg-white/10 transition-colors duration-200"
            >
              <Play aria-hidden="true" className="h-4 w-4" />
              Voir la démo
            </a>
          </div>

          <div className="flex items-center gap-12 pt-2 border-t border-white/8 flex-wrap">
            {STATS.map(({ value, label }) => (
              <div key={label} className="h-stat text-center pt-8">
                <div className=" text-2xl font-medium text-white leading-none">
                  {value}
                </div>
                <div className="font-mono text-[10px] tracking-[.12em] uppercase text-white/38 mt-1.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — card mockup */}
        <div className="relative flex items-center justify-center">
          {/* Floating validation badge */}
          <div
            className="h-float absolute -top-6 right-0 lg:-right-4 rounded-2xl p-4 w-52 z-10"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 50px rgba(15,23,41,.4)",
            }}
          >
            <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-gold-400/20 flex items-center justify-center">
              <Check aria-hidden="true" className="h-3 w-3 text-gold-300" />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/50 mb-0.5">
              Demande Validée
            </p>
            <p className="font-semibold text-sm text-white mb-3">Congé Payé</p>
            <div className="flex justify-between text-xs text-white/55 mt-1">
              <span>Du</span>
              <span className="font-medium text-white">12 Août</span>
            </div>
            <div className="flex justify-between text-xs text-white/55 mt-1">
              <span>Au</span>
              <span className="font-medium text-white">24 Août</span>
            </div>
          </div>

          {/* Main employee card */}
          <div
            className="h-card rounded-2xl p-6 w-full max-w-sm mt-10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 24px 60px rgba(15,23,41,0.5)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-ink-900 shrink-0"
                style={{
                  background: "linear-gradient(140deg, #CBA24A, #947024)",
                }}
              >
                JD
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Jean Dupont</p>
                <p className="text-xs text-white/45">Directeur Marketing</p>
              </div>
            </div>

            <div
              className="rounded-xl p-4 mb-3"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-medium mb-1">
                Salaire Annuel
              </p>
              <p className="font-display text-2xl font-bold text-white">
                85 000 DH
              </p>
            </div>

            <div
              className="rounded-xl px-4 py-3 mb-5 flex items-center justify-between"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-2 text-sm text-white/55">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                Solde Congés
              </div>
              <span className="text-sm font-bold text-white">24 Jours</span>
            </div>

            <button
              onClick={openSignUp}
              className="w-full py-3 rounded-xl text-sm font-bold text-ink-900 cursor-pointer transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(140deg, #CBA24A, #947024)",
                boxShadow: "0 4px 14px rgba(180,134,47,.35)",
              }}
            >
              Gérer le profil
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
