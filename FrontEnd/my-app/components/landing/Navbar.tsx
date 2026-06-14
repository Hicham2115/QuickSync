"use client";
import { useState, useEffect } from "react";
import { LogIn, ArrowRight } from "lucide-react";
import { LogoMark } from "./LogoMark";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/useAppStore";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Comment ça marche", href: "#how" },
  { label: "Tarifs", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const openSignUp = useAppStore((s) => s.openSignUp);
  const openSignIn = useAppStore((s) => s.openSignIn);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 h-16 z-100",
        "flex items-center justify-between px-6 lg:px-12",
        "transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-neutral-200 shadow-sm"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      {/* Logo */}
      <a href="#" className="flex items-center gap-2">
        <LogoMark size={32} />
        <span
          className={`font-display text-lg font-semibold tracking-tight transition-colors duration-300 ${
            scrolled ? "text-ink-900" : "text-white"
          }`}
        >
          QuickSync
        </span>
      </a>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors duration-200 ${
              scrolled
                ? "text-neutral-500 hover:text-ink-900"
                : "text-white/75 hover:text-white"
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-2.5">
        <button
          onClick={() => openSignIn()}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            scrolled
              ? "text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
              : "text-white/80 border border-white/22 hover:bg-white/10"
          }`}
        >
          <LogIn aria-hidden="true" className="h-3.5 w-3.5" />
          Se connecter
        </button>
        <button
          onClick={() => openSignUp()}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-ink-900 transition-all duration-200 hover:-translate-y-px"
          style={{
            background: "linear-gradient(140deg, #CBA24A, #947024)",
            boxShadow: "0 4px 14px rgba(180,134,47,.32)",
          }}
        >
          Commencer <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Mobile — popover hamburger */}
      <div className="md:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Menu"
              className={`group size-9 rounded-lg transition-colors duration-200 ${
                scrolled
                  ? "text-ink-900 hover:bg-neutral-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {/* Animated hamburger → X */}
              <svg
                className="pointer-events-none"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path
                  className="-translate-y-1.75 origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
                  d="M4 12L20 12"
                />
                <path
                  className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  d="M4 12H20"
                />
                <path
                  className="translate-y-1.75 origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
                  d="M4 12H20"
                />
              </svg>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-56 p-2 rounded-xl border border-neutral-200 bg-white shadow-lg"
          >
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-ink-900 transition-colors duration-150"
                >
                  {link.label}
                </a>
              ))}

              <div className="h-px bg-neutral-100 my-1.5" />

              <a
                href="#"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors duration-150"
              >
                <LogIn
                  aria-hidden="true"
                  className="h-4 w-4 text-neutral-400"
                />
                Se connecter
              </a>
              <a
                href="#"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 mx-1 mt-1 py-2.5 rounded-lg text-sm font-bold text-ink-900"
                style={{
                  background: "linear-gradient(140deg, #CBA24A, #947024)",
                }}
              >
                Commencer{" "}
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
