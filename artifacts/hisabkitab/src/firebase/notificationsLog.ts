import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { getDbInstance } from "./config";

export type NotifLog = {
  id: string;
  title: string;
  body: string;
  kind: string;
  read: boolean;
  createdAt: number;
};

const notifsCol = (uid: string) =>
  collection(getDbInstance(), "users", uid, "notifications");

const notifDoc = (uid: string, id: string) =>
  doc(getDbInstance(), "users", uid, "notifications", id);

export const recordNotification = async (
  uid: string,
  data: { title: string; body: string; kind: string },
) => {
  try {
    await addDoc(notifsCol(uid), {
      title: data.title,
      body: data.body,
      kind: data.kind,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch {
    // best-effort; ignore offline / permission errors
  }
};

export const subscribeNotifications = (
  uid: string,
  cb: (items: NotifLog[]) => void,
  onError?: (e: Error) => void,
) => {
  const q = query(notifsCol(uid), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      const items: NotifLog[] = snap.docs.map((d) => {
        const data = d.data() as {
          title?: string;
          body?: string;
          kind?: string;
          read?: boolean;
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
          title: data.title ?? "",
          body: data.body ?? "",
          kind: data.kind ?? "",
          read: Boolean(data.read),
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

export const markAsRead = async (uid: string, id: string) => {
  try {
    await updateDoc(notifDoc(uid, id), { read: true });
  } catch {
    // ignore
  }
};

export const markAllAsRead = async (uid: string, ids: string[]) => {
  if (ids.length === 0) return;
  try {
    const batch = writeBatch(getDbInstance());
    for (const id of ids) {
      batch.update(notifDoc(uid, id), { read: true });
    }
    await batch.commit();
  } catch {
    // ignore
  }
};

export const deleteNotification = async (uid: string, id: string) => {
  try {
    await deleteDoc(notifDoc(uid, id));
  } catch {
    // ignore
  }
};

export const clearAllNotifications = async (uid: string) => {
  try {
    const snap = await getDocs(notifsCol(uid));
    const batch = writeBatch(getDbInstance());
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch {
    // ignore
  }
};
