import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();

type NotificationSettings = {
  enabled?: boolean;
  reminderTime?: string;
  timezone?: string;
  fcmTokens?: Record<string, boolean>;
  lastReminderDate?: string;
};

type Budget = {
  daily?: number | null;
  perCategory?: Record<string, number>;
};

type AlertState = {
  daily?: { warn?: string; over?: string };
  categories?: Record<string, { warn?: string; over?: string }>;
};

const localDateKey = (timezone: string): string => {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

const localHHMM = (timezone: string): string => {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return fmt.format(new Date());
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
};

const minutesBetween = (a: string, b: string): number => {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return Math.abs(ah * 60 + am - (bh * 60 + bm));
};

const sendToTokens = async (
  uid: string,
  tokens: string[],
  title: string,
  body: string,
): Promise<void> => {
  if (tokens.length === 0) return;
  const responses = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    webpush: {
      notification: {
        title,
        body,
        icon: "/firebase-logo.png",
      },
      fcmOptions: {
        link: "/",
      },
    },
  });

  const cleanups: Promise<unknown>[] = [];
  responses.responses.forEach((res, i) => {
    if (!res.success) {
      const code = res.error?.code ?? "";
      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        cleanups.push(
          getFirestore()
            .doc(`users/${uid}/settings/notifications`)
            .update({ [`fcmTokens.${tokens[i]}`]: FieldValue.delete() })
            .catch(() => undefined),
        );
      } else {
        logger.warn("FCM send failed", { uid, code, message: res.error?.message });
      }
    }
  });
  await Promise.all(cleanups);
};

export const dailyReminder = onSchedule(
  { schedule: "every 15 minutes", timeZone: "UTC", region: "us-central1" },
  async () => {
    const db = getFirestore();
    const snap = await db
      .collectionGroup("settings")
      .where("enabled", "==", true)
      .get();

    let sent = 0;
    for (const doc of snap.docs) {
      if (doc.id !== "notifications") continue;
      const settings = doc.data() as NotificationSettings;
      const uid = doc.ref.parent.parent?.id;
      if (!uid) continue;

      const enabled = settings.enabled === true;
      const reminderTime = settings.reminderTime ?? "21:00";
      const timezone = settings.timezone ?? "UTC";
      const tokens = Object.keys(settings.fcmTokens ?? {});
      if (!enabled || tokens.length === 0) continue;

      const today = localDateKey(timezone);
      if (settings.lastReminderDate === today) continue;

      const now = localHHMM(timezone);
      if (minutesBetween(now, reminderTime) > 7) continue;

      try {
        await sendToTokens(
          uid,
          tokens,
          "HisabKitab daily reminder",
          "Don't forget to log today's expenses.",
        );
        await doc.ref.update({ lastReminderDate: today });
        sent++;
      } catch (err) {
        logger.error("Reminder send failed", { uid, err });
      }
    }
    logger.info("Daily reminder run complete", { sent, scanned: snap.size });
  },
);

const startOfTodayMs = (timezone: string): number => {
  try {
    const today = localDateKey(timezone);
    const [y, m, d] = today.split("-").map(Number);
    const guess = Date.UTC(y, m - 1, d, 0, 0, 0);
    const tzOffsetMs = guess - new Date(guess).getTime();
    return guess - tzOffsetMs;
  } catch {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
};

export const onExpenseCreated = onDocumentCreated(
  "users/{uid}/expenses/{expenseId}",
  async (event) => {
    const uid = event.params.uid as string;
    const newExpense = event.data?.data() as
      | { amount?: number; category?: string }
      | undefined;
    if (!newExpense) return;

    const db = getFirestore();
    const [budgetSnap, settingsSnap, alertStateSnap] = await Promise.all([
      db.doc(`users/${uid}/settings/budget`).get(),
      db.doc(`users/${uid}/settings/notifications`).get(),
      db.doc(`users/${uid}/settings/alertState`).get(),
    ]);

    const budget = (budgetSnap.data() ?? {}) as Budget;
    const settings = (settingsSnap.data() ?? {}) as NotificationSettings;
    const alertState = (alertStateSnap.data() ?? {}) as AlertState;
    const tokens = Object.keys(settings.fcmTokens ?? {});
    if (!settings.enabled || tokens.length === 0) return;

    const timezone = settings.timezone ?? "UTC";
    const today = localDateKey(timezone);
    const start = startOfTodayMs(timezone);

    const expensesSnap = await db
      .collection(`users/${uid}/expenses`)
      .where("createdAt", ">=", new Date(start))
      .get();

    let dailyTotal = 0;
    const categoryTotals: Record<string, number> = {};
    expensesSnap.docs.forEach((d) => {
      const data = d.data() as { amount?: number; category?: string };
      const amt = Number(data.amount ?? 0);
      dailyTotal += amt;
      const cat = String(data.category ?? "Other");
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + amt;
    });

    const updates: Record<string, string> = {};

    if (typeof budget.daily === "number" && budget.daily > 0) {
      const ratio = dailyTotal / budget.daily;
      if (ratio >= 1 && alertState.daily?.over !== today) {
        await sendToTokens(
          uid,
          tokens,
          "Budget crossed",
          `You crossed today's budget of Rs. ${budget.daily}. Spent Rs. ${Math.round(dailyTotal)}.`,
        );
        updates["daily.over"] = today;
      } else if (ratio >= 0.8 && alertState.daily?.warn !== today) {
        await sendToTokens(
          uid,
          tokens,
          "Budget warning",
          `You've used ${Math.round(ratio * 100)}% of today's Rs. ${budget.daily} budget.`,
        );
        updates["daily.warn"] = today;
      }
    }

    const newCat = String(newExpense.category ?? "Other");
    const catLimit = budget.perCategory?.[newCat];
    if (typeof catLimit === "number" && catLimit > 0) {
      const spent = categoryTotals[newCat] ?? 0;
      const ratio = spent / catLimit;
      const catState = alertState.categories?.[newCat] ?? {};
      if (ratio >= 1 && catState.over !== today) {
        await sendToTokens(
          uid,
          tokens,
          `${newCat} budget crossed`,
          `Spent Rs. ${Math.round(spent)} on ${newCat} (limit Rs. ${catLimit}).`,
        );
        updates[`categories.${newCat}.over`] = today;
      } else if (ratio >= 0.8 && catState.warn !== today) {
        await sendToTokens(
          uid,
          tokens,
          `${newCat} nearing limit`,
          `${Math.round(ratio * 100)}% of your ${newCat} budget used (Rs. ${Math.round(spent)} of Rs. ${catLimit}).`,
        );
        updates[`categories.${newCat}.warn`] = today;
      }
    }

    if (Object.keys(updates).length > 0) {
      await db
        .doc(`users/${uid}/settings/alertState`)
        .set(updates, { merge: true });
    }
  },
);
