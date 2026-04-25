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

export const reminderTimeKey = (uid: string) => `hk:reminder:time:${uid}`;
export const remindersEnabledKey = (uid: string) =>
  `hk:reminder:enabled:${uid}`;

export const getReminderTime = (uid: string): string => {
  if (typeof window === "undefined") return "21:00";
  return localStorage.getItem(reminderTimeKey(uid)) ?? "21:00";
};

export const setReminderTime = (uid: string, hhmm: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(reminderTimeKey(uid), hhmm);
};

export const getRemindersEnabled = (uid: string): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(remindersEnabledKey(uid)) === "1";
};

export const setRemindersEnabled = (uid: string, enabled: boolean) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(remindersEnabledKey(uid), enabled ? "1" : "0");
};

const wasAlerted = (uid: string, kind: string): boolean => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(k(uid, kind)) === "1";
};

const markAlerted = (uid: string, kind: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(k(uid, kind), "1");
};

export const fireOnce = (uid: string, kind: string, title: string, body: string) => {
  if (wasAlerted(uid, kind)) return;
  markAlerted(uid, kind);
  showLocalNotification(title, body);
};

const msUntilNext = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
};

export const scheduleDailyReminder = (
  uid: string,
  hhmm: string,
  onFire: () => void,
): (() => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let interval: ReturnType<typeof setInterval> | null = null;

  const arm = () => {
    const ms = msUntilNext(hhmm);
    timeout = setTimeout(() => {
      onFire();
      interval = setInterval(onFire, 24 * 60 * 60 * 1000);
    }, ms);
  };

  arm();
  return () => {
    if (timeout) clearTimeout(timeout);
    if (interval) clearInterval(interval);
  };
};
