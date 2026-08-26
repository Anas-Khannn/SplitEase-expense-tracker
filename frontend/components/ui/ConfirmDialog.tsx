"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="flex flex-col gap-4">
        {danger && (
          <div className="flex items-center gap-3 rounded-radius-md bg-danger-100 p-3">
            <AlertTriangle className="shrink-0 text-danger-500" size={20} />
            <p className="text-body-sm text-danger-500">
              This action cannot be undone.
            </p>
          </div>
        )}
        <div className="flex items-center justify-end gap-3 mt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            size="md"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            size="md"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { ConfirmDialog, type ConfirmDialogProps };
