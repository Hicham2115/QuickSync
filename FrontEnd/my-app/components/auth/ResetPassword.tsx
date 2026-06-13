"use client";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Mail, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((v) => z.email().safeParse(v).success, "Invalid email address"),
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

export default function ResetPassword({ onSwitch }: { onSwitch: () => void }) {
  const mutation = useMutation({
    mutationFn: async (values: { email: string }) => {
      const res = await api.post("/api/forgot-password", values);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Une erreur est survenue.")
        : "Une erreur est survenue.";
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
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

      <button
        type="submit"
        disabled={mutation.isPending || mutation.isSuccess}
        className="w-full h-11 rounded-xl text-sm font-bold font-sans text-ink-900 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        style={{
          background: "linear-gradient(140deg, #CBA24A, #947024)",
          boxShadow: "0 8px 24px rgba(180,134,47,0.36)",
        }}
      >
        {mutation.isPending ? "Envoi en cours..." : "Envoyer le lien"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>

      <p className="text-center text-xs text-white/32 pt-1 font-sans">
        Vous vous souvenez de votre mot de passe ?{" "}
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
