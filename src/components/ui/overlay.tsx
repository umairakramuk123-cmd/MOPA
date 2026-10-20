"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/format";
import { X } from "lucide-react";

function useLockScroll(open: boolean) {
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

function useEscape(open: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  description,
  eyebrow,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useLockScroll(open);
  useEscape(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[18px] border border-line bg-surface shadow-[var(--shadow-pop)] sm:rounded-[18px]",
              size === "sm" ? "sm:max-w-[420px]" : size === "lg" ? "sm:max-w-[720px]" : "sm:max-w-[548px]",
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
                <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
                {description && <p className="mt-1 text-[11.5px] leading-5 text-muted">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="pressable grid h-7 w-7 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-surface-3 hover:text-ink"
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  eyebrow,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  useLockScroll(open);
  useEscape(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[65]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-surface shadow-[var(--shadow-pop)]",
              width === "sm" ? "sm:max-w-[400px]" : width === "lg" ? "sm:max-w-[640px]" : "sm:max-w-[500px]",
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
                <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
                {description && <p className="mt-1 text-[11.5px] leading-5 text-muted">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="pressable grid h-7 w-7 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-surface-3 hover:text-ink"
                aria-label="Close panel"
              >
                <X size={15} />
              </button>
            </div>
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "brand";
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="pressable h-9 rounded-[10px] border border-line-strong px-3 text-[12px] font-medium text-ink-2 hover:bg-surface-3"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "pressable h-9 rounded-[10px] px-3 text-[12px] font-medium text-white dark:text-[#04140f]",
              tone === "danger" ? "bg-danger text-white" : "bg-brand",
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[12px] leading-6 text-muted">
        This action is recorded in the audit trail with your user ID and the current timestamp.
        The record is retained for compliance review.
      </p>
    </Modal>
  );
}
