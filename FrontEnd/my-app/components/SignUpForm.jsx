"use client";
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { X } from "lucide-react";
import { LogoMark } from "./landing/LogoMark";
import { RegisterForm } from "./auth/RegisterForm";
import { SignInForm } from "./auth/SignInForm";
import ResetPassword from "./auth/ResetPassword";

export default function SignUpForm({ onClose, initialMode = "signup" }) {
  const [mode, setMode] = useState(initialMode);
  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" },
    );
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.93, y: 28 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.45,
        ease: "back.out(1.5)",
        delay: 0.06,
      },
    );
  }, []);

  const handleClose = () => {
    gsap.to(cardRef.current, {
      opacity: 0,
      scale: 0.94,
      y: 16,
      duration: 0.22,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  const handleBackdrop = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const switchMode = (next) => {
    gsap.to(cardRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.16,
      ease: "power2.in",
      onComplete: () => {
        setMode(next);
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" },
        );
      },
    });
  };

  const titles = {
    signup: {
      heading: "Créer un compte",
      sub: "Commencez gratuitement — aucune carte requise.",
    },
    signin: {
      heading: "Bon retour parmi nous",
      sub: "Connectez-vous à votre espace QuickSync.",
    },
    reset: {
      heading: "Mot de passe oublié",
      sub: "Entrez votre e-mail pour recevoir un lien de réinitialisation.",
    },
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(8,12,22,0.80)", backdropFilter: "blur(10px)" }}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #131B2C 0%, #0F1729 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 32px 80px rgba(8,12,22,0.70), 0 8px 24px rgba(180,134,47,0.10)",
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse at top, black 0%, transparent 68%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at top, black 0%, transparent 68%)",
          }}
        />
        {/* Gold glow */}
        <div
          className="absolute top-0 right-0 w-2/3 h-48 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 80% 0%, rgba(203,162,74,0.16) 0%, transparent 58%)",
          }}
        />

        {/* Header */}
        <div className="relative z-10 px-8 pt-8 pb-6">
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="absolute cursor-pointer top-5 right-5 h-8 w-8 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/8 transition-colors duration-150"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2 mb-6">
            <LogoMark size={32} />
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              QuickSync
            </span>
          </div>

          <h2 className="font-display font-medium text-white text-[1.6rem] leading-tight mb-1.5">
            {titles[mode].heading}
          </h2>
          <p className="font-sans text-sm text-white/42 leading-relaxed">
            {titles[mode].sub}
          </p>
        </div>

        {/* Form — swaps based on mode */}
        {mode === "signup" ? (
          <RegisterForm onSwitch={() => switchMode("signin")} />
        ) : mode === "signin" ? (
          <SignInForm
            onSwitch={() => switchMode("signup")}
            ResetPassword={() => switchMode("reset")}
          />
        ) : mode === "reset" ? (
          <ResetPassword onSwitch={() => switchMode("signin")} />
        ) : null}
      </div>
    </div>
  );
}
