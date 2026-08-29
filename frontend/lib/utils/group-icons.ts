const GROUP_ICON_MAP: Record<string, string> = {
  plane: "✈️",
  home: "🏠",
  house: "🏠",
  restaurant: "🍽️",
  food: "🍕",
  groceries: "🛒",
  drink: "🍻",
  drinks: "🍹",
  coffee: "☕",
  travel: "🧳",
  trip: "🏝️",
  party: "🎉",
  gift: "🎁",
  bills: "🧾",
  car: "🚗",
  fuel: "⛽",
  pets: "🐾",
  sport: "⚽",
  fitness: "💪",
  music: "🎵",
  movie: "🎬",
  education: "📚",
  work: "💼",
  family: "👨‍👩‍👧",
  friends: "🤝",
  rent: "🏘️",
};

export function groupIcon(
  icon: string | null | undefined,
  fallback = "📁"
): string {
  if (!icon) return fallback;
  const normalized = icon.trim().toLowerCase();
  return GROUP_ICON_MAP[normalized] ?? icon;
}