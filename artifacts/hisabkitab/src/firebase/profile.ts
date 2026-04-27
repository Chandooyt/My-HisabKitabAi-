import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDbInstance } from "./config";

export type Profile = {
  isPremium: boolean;
  displayName?: string | null;
  premiumSince?: number | null;
  paymentRequested: boolean;
  paymentRequestedAt?: number | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  monthlyTotal: number;
};

export const profileDoc = (uid: string) =>
  doc(getDbInstance(), "users", uid, "profile", "main");

export const subscribeProfile = (
  uid: string,
  cb: (profile: Profile) => void,
  onError?: (e: Error) => void,
) =>
  onSnapshot(
    profileDoc(uid),
    (snap) => {
      const data = (snap.data() ?? {}) as {
        isPremium?: boolean;
        displayName?: string | null;
        premiumSince?: { toMillis?: () => number } | number | null;
        paymentRequested?: boolean;
        paymentRequestedAt?: { toMillis?: () => number } | number | null;
        paymentMethod?: string | null;
        paymentReference?: string | null;
        monthlyTotal?: number;
      };
      const toMs = (v: { toMillis?: () => number } | number | null | undefined): number | null => {
        if (v && typeof v === "object" && typeof v.toMillis === "function") {
          return v.toMillis();
        }
        if (typeof v === "number") return v;
        return null;
      };
      cb({
        isPremium: Boolean(data.isPremium),
        displayName: data.displayName ?? null,
        premiumSince: toMs(data.premiumSince),
        paymentRequested: Boolean(data.paymentRequested),
        paymentRequestedAt: toMs(data.paymentRequestedAt),
        paymentMethod: data.paymentMethod ?? null,
        paymentReference: data.paymentReference ?? null,
        monthlyTotal:
          typeof data.monthlyTotal === "number" && data.monthlyTotal > 0
            ? data.monthlyTotal
            : 0,
      });
    },
    (err) => {
      if (onError) onError(err);
    },
  );

export const setPremium = async (uid: string, isPremium: boolean) => {
  await setDoc(
    profileDoc(uid),
    {
      isPremium,
      premiumSince: isPremium ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const setDisplayName = async (uid: string, displayName: string) => {
  await setDoc(
    profileDoc(uid),
    { displayName, updatedAt: serverTimestamp() },
    { merge: true },
  );
};

export const requestPayment = async (
  uid: string,
  data: { method: string; reference?: string },
) => {
  await setDoc(
    profileDoc(uid),
    {
      paymentRequested: true,
      paymentRequestedAt: serverTimestamp(),
      paymentMethod: data.method,
      paymentReference: data.reference ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const resetMonthlyTotal = async (uid: string) => {
  await setDoc(
    profileDoc(uid),
    { monthlyTotal: 0, updatedAt: serverTimestamp() },
    { merge: true },
  );
};

export const cancelPaymentRequest = async (uid: string) => {
  await setDoc(
    profileDoc(uid),
    {
      paymentRequested: false,
      paymentRequestedAt: null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};
