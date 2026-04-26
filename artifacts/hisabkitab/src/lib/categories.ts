export const CATEGORIES = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Fuel",
  "Rent",
  "Mobile/Internet",
  "Mobile Load",
  "EasyPaisa",
  "JazzCash",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const isFixedCategory = (value: string): value is Category =>
  (CATEGORIES as readonly string[]).includes(value);

export const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍽️",
  Travel: "🚌",
  Bills: "🧾",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Health: "💊",
  Education: "📚",
  Fuel: "⛽",
  Rent: "🏠",
  "Mobile/Internet": "📶",
  "Mobile Load": "📱",
  EasyPaisa: "💸",
  JazzCash: "💳",
  Other: "📦",
};

export const iconFor = (category: string): string =>
  CATEGORY_ICONS[category] ?? "📦";
