"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Input, Button } from "@/components/ui";
import { useCreateGroup } from "@/hooks/mutations/useCreateGroup";
import {
  createGroupSchema,
  type CreateGroupFormData,
} from "@/lib/validation/groupSchemas";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const createGroup = useCreateGroup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateGroupFormData) => {
    const payload = {
      name: data.name,
      ...(data.description ? { description: data.description } : {}),
    };

    createGroup.mutate(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (createGroup.isPending) return;
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create a group"
      description="Give your group a name so members can find it."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <Input
            label="Group name"
            placeholder="e.g. Apartment 4B"
            required
            autoComplete="off"
            disabled={createGroup.isPending}
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Description"
            placeholder="What's this group for? (optional)"
            autoComplete="off"
            disabled={createGroup.isPending}
            error={errors.description?.message}
            {...register("description")}
          />

          {createGroup.isError && (
            <p className="text-body-sm text-danger-500" role="alert">
              {createGroup.error?.message ?? "Failed to create group. Please try again."}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={createGroup.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={createGroup.isPending}
          >
            Create group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
