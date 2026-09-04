"use client";

import { ConfirmDialog } from "@/components/ui";

interface LogoutConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

function LogoutConfirmationDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
}: LogoutConfirmationDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Log out"
      description="Are you sure you want to logout?"
      confirmLabel="Logout"
      cancelLabel="Cancel"
      loading={loading}
    />
  );
}

export { LogoutConfirmationDialog, type LogoutConfirmationDialogProps };