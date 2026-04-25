export const formatRupees = (amount: number): string => {
  if (Number.isNaN(amount)) return "Rs 0";
  return `Rs ${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })}`;
};

export const startOfTodayMs = (): number => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const endOfTodayMs = (): number => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

export const formatDateTime = (ms: number): string => {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
