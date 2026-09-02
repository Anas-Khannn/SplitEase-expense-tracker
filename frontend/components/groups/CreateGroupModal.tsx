"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Input, Button } from "@/components/ui";
import { useCreateGroup } from "@/hooks/mutations/useCreateGroup";
import { groupIcon } from "@/lib/utils/group-icons";
import { cn } from "@/lib/utils/cn";
import {
  createGroupSchema,
  type CreateGroupFormData,
} from "@/lib/validation/groupSchemas";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

const ICON_OPTIONS = [
  "home",
  "house",
  "food",
  "restaurant",
  "groceries",
  "drink",
  "coffee",
  "travel",
  "trip",
  "party",
  "gift",
  "bills",
  "car",
  "pets",
  "sport",
  "work",
  "rent",
  "friends",
] as const;

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const createGroup = useCreateGroup();
  const [selectedIcon, setSelectedIcon] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      icon: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateGroupFormData) => {
    const payload = {
      name: data.name,
      icon: selectedIcon || undefined,
      ...(data.description ? { description: data.description } : {}),
    };

    createGroup.mutate(payload, {
      onSuccess: () => {
        reset();
        setSelectedIcon("");
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (createGroup.isPending) return;
    reset();
    setSelectedIcon("");
    onClose();
  };

  const toggleIcon = (icon: string) => {
    setSelectedIcon((current) => (current === icon ? "" : icon));
  };

  const iconPreview = ICON_OPTIONS.find((icon) => icon === selectedIcon);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create a group"
      description="Give your group a name and pick an icon so members can recognize it."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Input
            label="Group name"
            placeholder="e.g. Apartment 4B"
            required
            autoComplete="off"
            disabled={createGroup.isPending}
            error={errors.name?.message}
            {...register("name")}
          />

          <fieldset disabled={createGroup.isPending}>
            <legend className="mb-2 text-sm font-medium text-text-primary">
              Choose an icon
            </legend>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => {
                const selected = selectedIcon === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => toggleIcon(icon)}
                    aria-pressed={selected}
                    aria-label={`Select ${icon} icon`}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-md border text-lg transition-colors duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
                      selected
                        ? "border-primary bg-primary-100"
                        : "border-border-default bg-surface-alt hover:border-primary/40"
                    )}
                  >
                    <span aria-hidden="true">{groupIcon(icon)}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span aria-hidden="true">{groupIcon(selectedIcon)}</span>
              <span>
                {iconPreview
                  ? `${iconPreview} selected`
                  : "No icon selected — a default will be used."}
              </span>
            </div>
          </fieldset>

          <Input
            label="Description"
            placeholder="What's this group for? (optional)"
            autoComplete="off"
            disabled={createGroup.isPending}
            error={errors.description?.message}
            {...register("description")}
          />

          {createGroup.isError && (
            <p className="text-sm text-danger-500" role="alert">
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
