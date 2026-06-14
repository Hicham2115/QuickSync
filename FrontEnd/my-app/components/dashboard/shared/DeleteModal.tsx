"use client";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  preview: React.ReactNode;
  description?: string;
  onConfirm: () => void;
  isPending?: boolean;
  confirmLabel?: string;
}

export function DeleteModal({
  open,
  onClose,
  title,
  preview,
  description = "Cette action est définitive et irréversible.",
  onConfirm,
  isPending = false,
  confirmLabel = "Supprimer",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isPending && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-sm p-0 gap-0 overflow-hidden rounded-lg border border-warm-200"
        style={{ boxShadow: "0 16px 40px rgba(15,23,41,.13), 0 2px 8px rgba(15,23,41,.07)" }}
      >
        <VisuallyHidden.Root>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden.Root>

        <button
          onClick={() => !isPending && onClose()}
          className="absolute top-4 right-4 w-7 h-7 rounded-md flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-ink-700 transition-colors cursor-pointer z-10"
        >
          <X size={14} aria-hidden="true" />
        </button>

        <div className="px-7 pt-7 pb-6 flex flex-col gap-5">
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-lg" style={{ background: "#B4453A" }} />
          <div className="pt-1">{preview}</div>
          <p className="font-sans text-[14px] text-ink-800 leading-relaxed">{description}</p>
        </div>

        <div className="px-7 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #DEDED8" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="font-sans text-[13px] text-warm-500 hover:text-ink-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2 rounded-md font-sans text-[13px] font-semibold text-white border-none cursor-pointer disabled:opacity-60 transition-opacity"
            style={{ background: "#B4453A" }}
          >
            {isPending ? "Suppression…" : confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
