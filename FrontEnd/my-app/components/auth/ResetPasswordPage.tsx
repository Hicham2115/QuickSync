"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { useState } from "react";
import { LogoMark } from "@/components/landing/LogoMark";

const baseSchema = z.object({
  password: z
    .string()
    .min(8, "Au moins 8 caractères")
    .regex(/[A-Z]/, "Au moins 1 majuscule")
    .regex(/[a-z]/, "Au moins 1 minuscule")
    .regex(/[0-9]/, "Au moins 1 chiffre"),
  confirmPassword: z.string().min(1, "Confirmez votre mot de passe"),
});

const zodValidator =
  (fieldSchema: z.ZodTypeAny) =>
  ({ value }: { value: unknown }) => {
    const result = fieldSchema.safeParse(value);
    return result.success ? undefined : result.error.issues[0].message;
  };

const inputClass =
  "w-full h-11 rounded-xl text-sm font-sans text-white placeholder-white/30 outline-none transition-all duration-200 focus:ring-1 focus:ring-gold-400/40";
const inputStyle = {
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.10)",
};

export function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: async (values: { password: string; confirmPassword: string }) => {
      const res = await api.post("/api/reset-password", {
        token,
        email,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter.");
      router.push("/");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Une erreur est survenue.")
        : "Une erreur est survenue.";
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, #0B1120 0%, #0F1729 100%)" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #131B2C 0%, #0F1729 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 32px 80px rgba(8,12,22,0.70), 0 8px 24px rgba(180,134,47,0.10)",
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse at top, black 0%, transparent 68%)",
            WebkitMaskImage: "radial-gradient(ellipse at top, black 0%, transparent 68%)",
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
          <div className="flex items-center gap-2 mb-6">
            <LogoMark size={32} />
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              WorkSync
            </span>
          </div>
          <h2 className="font-display font-medium text-white text-[1.6rem] leading-tight mb-1.5">
            Nouveau mot de passe
          </h2>
          <p className="font-sans text-sm text-white/42 leading-relaxed">
            Choisissez un mot de passe sécurisé pour votre compte.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="relative z-10 px-8 pb-8 space-y-3.5"
        >
          {/* Password */}
          <form.Field
            name="password"
            validators={{ onSubmit: zodValidator(baseSchema.shape.password) }}
            children={(field) => (
              <div>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/28 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="Nouveau mot de passe"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`${inputClass} pl-10 pr-11`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/28 hover:text-white/60 transition-colors duration-150"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1.5 text-xs font-sans text-status-red pl-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />

          {/* Confirm password */}
          <form.Field
            name="confirmPassword"
            validators={{
              onSubmit: ({ value }) => {
                if (!value) return "Confirmez votre mot de passe";
                if (value !== form.getFieldValue("password"))
                  return "Les mots de passe ne correspondent pas";
                return undefined;
              },
            }}
            children={(field) => (
              <div>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/28 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id={field.name}
                    name={field.name}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirmer le mot de passe"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`${inputClass} pl-10 pr-11`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/28 hover:text-white/60 transition-colors duration-150"
                    aria-label={showConfirm ? "Masquer" : "Afficher"}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1.5 text-xs font-sans text-status-red pl-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          />

          <button
            type="submit"
            disabled={mutation.isPending || mutation.isSuccess}
            className="w-full h-11 rounded-xl text-sm font-bold font-sans text-ink-900 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: "linear-gradient(140deg, #CBA24A, #947024)",
              boxShadow: "0 8px 24px rgba(180,134,47,0.36)",
            }}
          >
            {mutation.isPending ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
