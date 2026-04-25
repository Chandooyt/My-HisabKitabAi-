import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { getDbInstance } from "./config";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  customCategory?: string | null;
  note?: string | null;
  createdAt: number;
};

export type Budget = {
  daily: number | null;
  perCategory: Record<string, number>;
};

const userExpensesCol = (uid: string) =>
  collection(getDbInstance(), "users", uid, "expenses");

const userBudgetDoc = (uid: string) =>
  doc(getDbInstance(), "users", uid, "settings", "budget");

export const subscribeExpenses = (
  uid: string,
  cb: (items: Expense[]) => void,
  onError?: (e: Error) => void,
) => {
  const q = query(userExpensesCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items: Expense[] = snap.docs.map((d) => {
        const data = d.data() as {
          amount?: number;
          category?: string;
          customCategory?: string | null;
          note?: string | null;
          createdAt?: { toMillis?: () => number } | number | null;
        };
        let createdAt = Date.now();
        const ca = data.createdAt;
        if (ca && typeof ca === "object" && typeof ca.toMillis === "function") {
          createdAt = ca.toMillis();
        } else if (typeof ca === "number") {
          createdAt = ca;
        }
        return {
          id: d.id,
          amount: Number(data.amount ?? 0),
          category: String(data.category ?? "Other"),
          customCategory: data.customCategory ?? null,
          note: data.note ?? null,
          createdAt,
        };
      });
      cb(items);
    },
    (err) => {
      if (onError) onError(err);
    },
  );
};

export const addExpense = async (
  uid: string,
  data: {
    amount: number;
    category: string;
    customCategory?: string | null;
    note?: string | null;
  },
) => {
  await addDoc(userExpensesCol(uid), {
    amount: data.amount,
    category: data.category,
    customCategory: data.customCategory ?? null,
    note: data.note ?? null,
    createdAt: serverTimestamp(),
  });
};

export const removeExpense = async (uid: string, id: string) => {
  await deleteDoc(doc(getDbInstance(), "users", uid, "expenses", id));
};

export const subscribeBudget = (
  uid: string,
  cb: (b: Budget) => void,
  onError?: (e: Error) => void,
) => {
  return onSnapshot(
    userBudgetDoc(uid),
    (snap) => {
      const data = (snap.data() ?? {}) as Partial<Budget>;
      cb({
        daily:
          typeof data.daily === "number" && data.daily > 0 ? data.daily : null,
        perCategory:
          (data.perCategory as Record<string, number> | undefined) ?? {},
      });
    },
    (err) => {
      if (onError) onError(err);
    },
  );
};

export const getBudget = async (uid: string): Promise<Budget> => {
  const snap = await getDoc(userBudgetDoc(uid));
  const data = (snap.data() ?? {}) as Partial<Budget>;
  return {
    daily:
      typeof data.daily === "number" && data.daily > 0 ? data.daily : null,
    perCategory:
      (data.perCategory as Record<string, number> | undefined) ?? {},
  };
};

export const setBudget = async (uid: string, budget: Budget) => {
  await setDoc(userBudgetDoc(uid), budget, { merge: true });
};
