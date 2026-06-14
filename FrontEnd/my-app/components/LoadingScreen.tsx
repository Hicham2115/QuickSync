"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const el = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const barTrackRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Logo mark pops in
    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }
    )
    // Letter fades in inside the mark
    .fromTo(
      letterRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      "-=0.2"
    )
    // Brand name slides in
    .fromTo(
      wordRef.current,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
      "-=0.1"
    )
    // Progress bar track fades in
    .fromTo(
      barTrackRef.current,
      { opacity: 0, scaleX: 0.4 },
      { opacity: 1, scaleX: 1, duration: 0.35, ease: "power2.out" },
      "-=0.1"
    )
    // Bar fill sweeps across
    .fromTo(
      barFillRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.9, ease: "power1.inOut" },
      "+=0.05"
    )
    // Whole screen fades out
    .to(el.current, {
      opacity: 0,
      duration: 0.55,
      delay: 0.15,
      ease: "power2.inOut",
      onComplete,
    });
  }, []);

  return (
    <div
      ref={el}
      className="fixed inset-0 flex flex-col items-center justify-center gap-10"
      style={{
        zIndex: 9999,
        background: "linear-gradient(135deg, #0d1829 0%, #111c30 50%, #162240 100%)",
      }}
    >
      {/* Subtle radial glow behind logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,130,200,0.15) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />

      {/* Logo + wordmark */}
      <div className="relative flex items-center gap-3.5">
        <div
          ref={logoRef}
          className="flex items-center justify-center shrink-0"
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "#1B2B4B",
            border: "1.5px solid rgba(255,255,255,0.12)",
            boxShadow: "0 0 0 6px rgba(99,130,200,0.08), 0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <span
            ref={letterRef}
            className="font-display font-bold text-white leading-none"
            style={{ fontSize: 26 }}
          >
            W
          </span>
        </div>

        <span
          ref={wordRef}
          className="font-display font-semibold text-white tracking-tight"
          style={{ fontSize: 26, letterSpacing: "-0.02em" }}
        >
          QuickSync
        </span>
      </div>

      {/* Progress bar */}
      <div
        ref={barTrackRef}
        className="relative overflow-hidden"
        style={{
          width: 160,
          height: 3,
          borderRadius: 99,
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          ref={barFillRef}
          className="absolute inset-0 origin-left"
          style={{
            borderRadius: 99,
            background: "linear-gradient(90deg, rgba(99,130,200,0.6), rgba(160,185,240,0.9))",
            boxShadow: "0 0 10px rgba(130,160,230,0.5)",
          }}
        />
      </div>
    </div>
  );
}
