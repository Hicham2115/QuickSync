"use client";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import SignUpForm from "@/components/SignUpForm";
import { useAppStore } from "@/lib/store/useAppStore";
import { TrustedBy } from "./TrustedBy";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { DashboardPreview } from "./DashboardPreview";
import { Testimonials } from "./Testimonials";
import { Pricing } from "./Pricing";
import { FAQ } from "./FAQ";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";

export function LandingPage() {
  const [loading, setLoading] = useState(true);
  const { isAuthOpen, authMode, closeAuth } = useAppStore();

  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      {isAuthOpen && <SignUpForm initialMode={authMode} onClose={closeAuth} />}
      <div>
        <Navbar />
        <Hero animate={!loading} />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}
