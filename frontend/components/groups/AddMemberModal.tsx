"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Input, Button } from "@/components/ui";
import { useAddGroupMember } from "@/hooks/mutations";
import {
  addMemberSchema,
  type AddMemberFormData,
} from "@/lib/validation/memberSchemas";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

export function AddMemberModal({
  open,
  onClose,
  groupId,
}: AddMemberModalProps) {
  const addMember = useAddGroupMember();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { userId: "" },
  });

  const onSubmit = (data: AddMemberFormData) => {
    addMember.mutate(
      { groupId, userId: data.userId },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (addMember.isPending) return;
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a member"
      description="Enter the user ID of the person you want to add to this group."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <Input
            label="User ID"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            required
            autoComplete="off"
            disabled={addMember.isPending}
            error={errors.userId?.message}
            {...register("userId")}
          />

          {addMember.isError && (
            <p className="text-sm text-danger-500" role="alert">
              {addMember.error instanceof Error
                ? addMember.error.message
                : "Failed to add member. Please try again."}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={addMember.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={addMember.isPending}
          >
            Add member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
