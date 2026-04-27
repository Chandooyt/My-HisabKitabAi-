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
};

const profileDoc = (uid: string) =>
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
      };
      let premiumSince: number | null = null;
      const ps = data.premiumSince;
      if (ps && typeof ps === "object" && typeof ps.toMillis === "function") {
        premiumSince = ps.toMillis();
      } else if (typeof ps === "number") {
        premiumSince = ps;
      }
      cb({
        isPremium: Boolean(data.isPremium),
        displayName: data.displayName ?? null,
        premiumSince,
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
