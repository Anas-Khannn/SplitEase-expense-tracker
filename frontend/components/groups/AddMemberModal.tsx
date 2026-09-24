"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Input, Button } from "@/components/ui";
import { useAddGroupMember } from "@/hooks/mutations";
import { useUserSearch } from "@/hooks";
import {
  addMemberSchema,
  type AddMemberFormData,
} from "@/lib/validation/memberSchemas";
import { useWatch } from "react-hook-form";

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
    setValue,
    control,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { identifier: "" },
  });

  const identifier = useWatch({ control, name: "identifier" }) ?? "";
  const search = useUserSearch(identifier);

  const onSubmit = (data: AddMemberFormData) => {
    addMember.mutate(
      { groupId, identifier: data.identifier },
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

  const selectedIdentifier =
    identifier.includes("@") || !identifier
      ? identifier
      : undefined;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a member"
      description="Enter an email address or username to find and add someone to this group."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Email or username"
              placeholder="e.g. jane@example.com or jane_doe"
              required
              autoComplete="off"
              disabled={addMember.isPending}
              error={errors.identifier?.message}
              {...register("identifier")}
            />

            {search.isSuccess &&
              search.data.length > 0 &&
              !identifier.includes("@") &&
              !addMember.isPending && (
                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-md">
                  {search.data.map((user) => (
                    <li key={user.user_id}>
                      <button
                        type="button"
                        onClick={() => {
                          setValue("identifier", user.username || user.email, {
                            shouldValidate: true,
                          });
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors hover:bg-muted"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">
                            {user.name}
                          </span>
                          <span className="block truncate text-muted-foreground">
                            {user.username ? `@${user.username}` : user.email}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {selectedIdentifier && search.isFetched && (
            <p className="-mt-2 text-xs text-muted-foreground">
              You can also pick from suggestions above (or enter{" "}
              <span className="font-mono">@{selectedIdentifier}</span>).
            </p>
          )}

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