import { showLocalNotification } from "@/firebase/messaging";

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const k = (uid: string, kind: string) =>
  `hk:alert:${uid}:${todayKey()}:${kind}`;

const wasAlerted = (uid: string, kind: string): boolean => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(k(uid, kind)) === "1";
};

const markAlerted = (uid: string, kind: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(k(uid, kind), "1");
};

export const fireOnce = (
  uid: string,
  kind: string,
  title: string,
  body: string,
) => {
  if (wasAlerted(uid, kind)) return;
  markAlerted(uid, kind);
  showLocalNotification(title, body);
};
