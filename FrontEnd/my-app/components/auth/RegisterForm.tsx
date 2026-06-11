"use client";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";

const baseSchema = z.object({
  CompleteName: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .refine((v) => !v.includes("error"), {
      message: 'Name cannot contain "error"',
    }),
  email: z
    .string()
    .min(1, "Email is required")
    .refine((v) => z.email().safeParse(v).success, "Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
    .regex(/[0-9]/, "Must contain at least 1 number"),
  confirmPassword: z.string(),
});

const schema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  { message: "Passwords do not match", path: ["confirmPassword"] },
);

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

export function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (values: {
      email: string;
      password: string;
      CompleteName: string;
      confirmPassword: string;
    }) => {
      const res = await api.post("/api/signup", {
        CompleteName: values.CompleteName,
        email: values.email,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      return res.data;
    },

    onSuccess: (data) => {
      console.log("User created:", data);
      toast.success("Account created successfully! Please sign in.");
      onSwitch();
    },

    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Failed to create account.")
        : "Failed to create account.";
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: {
      CompleteName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Submitting form with values:", value);
      signupMutation.mutate(value);
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
      {/* Full name */}
      <form.Field
        name="CompleteName"
        validators={{ onSubmit: zodValidator(baseSchema.shape.CompleteName) }}
        children={(field) => (
          <div>
            <div className="relative">
              <User
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/28 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id={field.name}
                name={field.name}
                type="text"
                placeholder="Nom complet"
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

      {/* Email */}
      <form.Field
        name="email"
        validators={{ onSubmit: zodValidator(baseSchema.shape.email) }}
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

      {/* Confirm password */}
      <form.Field
        name="confirmPassword"
        validators={{
          onSubmit: ({ value }) => {
            const password = form.getFieldValue("password");
            if (!value) return "Confirm your password";
            if (value !== password) return "Passwords do not match";
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
        className="w-full h-11 rounded-xl text-sm font-bold font-sans text-ink-900 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-px active:translate-y-0"
        style={{
          background: "linear-gradient(140deg, #CBA24A, #947024)",
          boxShadow: "0 8px 24px rgba(180,134,47,0.36)",
        }}
      >
        Créer mon compte
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Switch to sign in */}
      <p className="text-center text-xs text-white/32 pt-1 font-sans">
        Déjà un compte ?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-gold-400 cursor-pointer hover:text-gold-300 font-semibold transition-colors duration-150"
        >
          Se connecter
        </button>
      </p>
    </form>
  );
}
