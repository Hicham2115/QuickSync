"use client";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((v) => z.email().safeParse(v).success, "Invalid email address"),
  password: z.string().min(1, "Password is required"),
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

export function SignInForm({ onSwitch , ResetPassword}: { onSwitch: () => void; ResetPassword: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const res = await api.post("/api/login", values);
      return res.data;
    },

    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      toast.success(`Bon retour, ${data.user.CompleteName} !`);
      router.push("/dashboard");
    },

    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Invalid credentials.")
        : "Failed to sign in.";
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="relative z-10 px-8 pb-8 space-y-3.5"
    >
      {/* Email */}
      <form.Field
        name="email"
        validators={{ onSubmit: zodValidator(schema.shape.email) }}
        children={(field) => (
          <div>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/28 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id={field.name}
                name={field.name}
                type="email"
                placeholder="Adresse e-mail"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`${inputClass} pl-10 pr-4`}
                style={inputStyle}
              />
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="mt-1.5 text-xs font-sans text-status-red pl-1">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      />

      {/* Password */}
      <form.Field
        name="password"
        validators={{ onSubmit: zodValidator(schema.shape.password) }}
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
                placeholder="Mot de passe"
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

      {/* Forgot password */}
      <div className="flex justify-end -mt-0.5">
        <button
          onClick={ResetPassword}
          type="button"
          className="text-xs font-sans text-gold-400/65 hover:text-gold-300 transition-colors duration-150"
        >
          Mot de passe oublié ?
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-white/8" />
        <span className="font-mono text-[10px] tracking-[.12em] uppercase text-white/22">
          ou
        </span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-11 rounded-xl text-sm font-bold font-sans text-ink-900 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        style={{
          background: "linear-gradient(140deg, #CBA24A, #947024)",
          boxShadow: "0 8px 24px rgba(180,134,47,0.36)",
        }}
      >
        {loginMutation.isPending ? "Connexion..." : "Se connecter"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Switch to register */}
      <p className="text-center text-xs text-white/32 pt-1 font-sans">
        Pas encore de compte ?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-gold-400 cursor-pointer hover:text-gold-300 font-semibold transition-colors duration-150"
        >
          S&apos;inscrire
        </button>
      </p>
    </form>
  );
}
