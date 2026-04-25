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
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const isFixedCategory = (value: string): value is Category =>
  (CATEGORIES as readonly string[]).includes(value);
