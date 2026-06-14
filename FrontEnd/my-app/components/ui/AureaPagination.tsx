"use client";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4)  return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function AureaPagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = pageRange(page, totalPages);

  const btnBase =
    "h-8 min-w-8 px-2 rounded-md font-sans text-[12px] font-medium border transition-colors cursor-pointer flex items-center justify-center gap-0.5 select-none";
  const activeBtn = `${btnBase} border-ink-700 bg-ink-800 text-white`;
  const idleBtn   = `${btnBase} border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-ink-700 hover:bg-warm-50`;
  const disabledBtn = `${btnBase} border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed`;

  return (
    <Pagination className="mx-0 justify-start">
      <PaginationContent className="gap-1">
        {/* Prev */}
        <PaginationItem>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={page === 1 ? disabledBtn : idleBtn}
            aria-label="Page précédente"
          >
            <ChevronLeft size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Préc.</span>
          </button>
        </PaginationItem>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "…" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis className="h-8 w-8 text-warm-400" />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <button
                onClick={() => onPageChange(p)}
                className={p === page ? activeBtn : idleBtn}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            </PaginationItem>
          )
        )}

        {/* Next */}
        <PaginationItem>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={page === totalPages ? disabledBtn : idleBtn}
            aria-label="Page suivante"
          >
            <span className="hidden sm:inline">Suiv.</span>
            <ChevronRight size={13} aria-hidden="true" />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
