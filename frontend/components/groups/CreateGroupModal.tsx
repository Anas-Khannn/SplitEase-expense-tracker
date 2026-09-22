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
import { Smile, Shuffle, X } from "lucide-react";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

type EmojiCategory = "popular" | "living" | "dining" | "travel" | "fun" | "more";

interface CategoryDef {
  id: EmojiCategory;
  label: string;
  icon: string;
  items: string[];
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "popular",
    label: "Popular",
    icon: "🌟",
    items: [
      "home",
      "apartment",
      "food",
      "restaurant",
      "groceries",
      "coffee",
      "travel",
      "trip",
      "party",
      "car",
      "friends",
      "bills",
    ],
  },
  {
    id: "living",
    label: "Living",
    icon: "🏠",
    items: ["home", "house", "apartment", "rent", "bills", "hotel"],
  },
  {
    id: "dining",
    label: "Dining",
    icon: "🍕",
    items: ["restaurant", "food", "groceries", "coffee", "drink", "drinks"],
  },
  {
    id: "travel",
    label: "Travel",
    icon: "✈️",
    items: [
      "travel",
      "trip",
      "plane",
      "flight",
      "car",
      "fuel",
      "beach",
      "ski",
    ],
  },
  {
    id: "fun",
    label: "Fun",
    icon: "🎉",
    items: [
      "party",
      "gift",
      "movie",
      "music",
      "game",
      "friends",
      "shopping",
    ],
  },
  {
    id: "more",
    label: "More",
    icon: "⚡",
    items: ["sport", "fitness", "pets", "work", "education", "family"],
  },
];

const ALL_ITEMS = Array.from(
  new Set(CATEGORIES.flatMap((c) => c.items))
);

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const createGroup = useCreateGroup();
  const [selectedIcon, setSelectedIcon] = useState("");
  const [activeCategory, setActiveCategory] = useState<EmojiCategory>("popular");
  const [customEmojiInput, setCustomEmojiInput] = useState("");

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
        setCustomEmojiInput("");
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (createGroup.isPending) return;
    reset();
    setSelectedIcon("");
    setCustomEmojiInput("");
    onClose();
  };

  const toggleIcon = (icon: string) => {
    if (selectedIcon === icon) {
      setSelectedIcon("");
      setCustomEmojiInput("");
    } else {
      setSelectedIcon(icon);
      setCustomEmojiInput("");
    }
  };

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * ALL_ITEMS.length);
    const chosen = ALL_ITEMS[randomIndex];
    setSelectedIcon(chosen);
    setCustomEmojiInput("");
  };

  const handleCustomEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomEmojiInput(val);
    if (val.trim()) {
      setSelectedIcon(val.trim());
    } else {
      setSelectedIcon("");
    }
  };

  const activeCategoryDef =
    CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];

  const currentDisplayEmoji = selectedIcon ? groupIcon(selectedIcon) : "📁";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create a group"
      description="Give your group a name and choose an emoji icon."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <Input
            label="Group name"
            placeholder="e.g. Apartment 4B, Paris Trip"
            required
            autoComplete="off"
            disabled={createGroup.isPending}
            error={errors.name?.message}
            {...register("name")}
          />

          {/* Mobile-First Emoji Picker Section */}
          <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3.5">
            {/* Header: Live Emoji Preview + Quick Randomize Button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-13 sm:size-14 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-3xl shadow-xs shrink-0 select-none transition-transform active:scale-95">
                  <span aria-hidden="true">{currentDisplayEmoji}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                    Group Emoji
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">
                    {selectedIcon
                      ? `Selected: ${currentDisplayEmoji} (${selectedIcon})`
                      : "Tap an emoji below or type your own"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRandomize}
                  title="Pick a random emoji"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs active:scale-95 touch-manipulation"
                >
                  <Shuffle className="size-3 text-zinc-500" />
                  <span className="hidden xs:inline">Random</span>
                </button>
                {selectedIcon && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIcon("");
                      setCustomEmojiInput("");
                    }}
                    title="Clear selection"
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Custom Emoji Input: Optimized for Mobile Keyboard */}
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <Smile className="size-4" />
              </div>
              <input
                type="text"
                value={customEmojiInput}
                onChange={handleCustomEmojiChange}
                placeholder="Or type/paste any emoji from your keyboard..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
              />
            </div>

            {/* Category Filter Pills: Touch Carousel */}
            <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none touch-pan-x">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-lg shrink-0 transition-colors flex items-center gap-1 active:scale-95 touch-manipulation",
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Responsive Emoji Grid: Large 44px Touch Targets */}
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {activeCategoryDef.items.map((item) => {
                const isSelected = selectedIcon === item;
                const emoji = groupIcon(item);

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleIcon(item)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${item} icon`}
                    className={cn(
                      "h-11 w-full rounded-xl text-xl flex items-center justify-center border transition-all active:scale-90 select-none touch-manipulation",
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs ring-2 ring-zinc-900/20"
                        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-foreground"
                    )}
                  >
                    <span aria-hidden="true">{emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Description"
            placeholder="What's this group for? (optional)"
            autoComplete="off"
            disabled={createGroup.isPending}
            error={errors.description?.message}
            {...register("description")}
          />

          {createGroup.isError && (
            <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
              {createGroup.error?.message ?? "Failed to create group. Please try again."}
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
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
