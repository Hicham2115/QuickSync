"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { Department } from "@/lib/mock/hr-data";

interface Props {
  department: Department | null;
  onClose: () => void;
}

export function DeleteDepartmentModal({ department, onClose }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await api.delete(`/api/departments/${department!.id}`);
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err))
          throw new Error(err.response?.data?.message ?? "Erreur lors de la suppression.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success(`${department?.name} a été supprimé.`);
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={!!department} onOpenChange={(v) => !v && !mutation.isPending && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-sm p-0 gap-0 overflow-hidden rounded-lg border border-warm-200"
        style={{ boxShadow: "0 16px 40px rgba(15,23,41,.13), 0 2px 8px rgba(15,23,41,.07)" }}
      >
        <VisuallyHidden.Root>
          <DialogTitle>Supprimer le département</DialogTitle>
        </VisuallyHidden.Root>

        <button
          onClick={() => !mutation.isPending && onClose()}
          className="absolute top-4 right-4 w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer z-10"
        >
          <X size={14} aria-hidden="true" />
        </button>

        <div className="px-7 pt-7 pb-6 flex flex-col gap-5">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-lg" style={{ background: "#B4453A" }} />

          {department && (
            <div className="flex items-center gap-3 pt-1">
              <div
                className="w-10 h-10 rounded-md shrink-0 flex items-center justify-center"
                style={{ background: department.color + "22" }}
              >
                <span style={{ color: department.color }} className="font-display text-[15px] font-bold">
                  {department.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-sans text-[14px] font-semibold text-ink-900 leading-tight">{department.name}</p>
                <p className="font-sans text-[12px] text-warm-500 mt-0.5">Responsable : {department.head}</p>
              </div>
            </div>
          )}

          <p className="font-sans text-[14px] text-ink-800 leading-relaxed">
            Ce département sera supprimé définitivement. Cette action est irréversible.
          </p>
        </div>

        <div className="px-7 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #DEDED8" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="font-sans text-[13px] text-warm-500 hover:text-ink-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-5 py-2 rounded-md font-sans text-[13px] font-semibold text-white border-none cursor-pointer disabled:opacity-60 transition-opacity"
            style={{ background: "#B4453A" }}
          >
            {mutation.isPending ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
