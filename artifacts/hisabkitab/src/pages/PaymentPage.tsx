import { useState } from "react";
import { useAuth } from "@/firebase/auth";
import {
  cancelPaymentRequest,
  requestPayment,
  type Profile,
} from "@/firebase/profile";
import type { PageId } from "@/components/Sidebar";
import { formatDateTime } from "@/lib/format";

type Props = {
  profile: Profile;
  onNavigate: (id: PageId) => void;
};

const EASYPAISA_NUMBER = "0333 5507075";
const JAZZCASH_INSTRUCTION = "Send from JazzCash to our Easypaisa number above";

export function PaymentPage({ profile, onNavigate }: Props) {
  const { user } = useAuth();
  const [method, setMethod] = useState<"jazzcash" | "easypaisa">("easypaisa");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePaid = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await requestPayment(user.uid, {
        method: method === "jazzcash" ? "JazzCash" : "Easypaisa",
        reference: reference.trim(),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Cancel this payment request?")
    ) {
      return;
    }
    setBusy(true);
    try {
      await cancelPaymentRequest(user.uid);
    } finally {
      setBusy(false);
    }
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText("03335507075");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  if (profile.isPremium) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-amber-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center text-3xl">
          👑
        </div>
        <h1 className="mt-4 text-2xl font-bold text-amber-800">
          You are on Premium Plan
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          All features are unlocked. Thank you for your support!
        </p>
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-6 py-2.5 text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (profile.paymentRequested) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
            ⏳
          </div>
          <h1 className="mt-4 text-2xl font-bold text-emerald-800">
            Payment under verification
          </h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Thanks! We've received your "I Have Paid" confirmation. Our team
            will verify your transfer and unlock Premium on your account
            usually within a few hours.
          </p>

          <div className="mt-5 text-left bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-sm space-y-1">
            <p>
              <span className="font-semibold text-gray-700">Method:</span>{" "}
              {profile.paymentMethod ?? "—"}
            </p>
            {profile.paymentReference && (
              <p>
                <span className="font-semibold text-gray-700">Reference:</span>{" "}
                {profile.paymentReference}
              </p>
            )}
            {profile.paymentRequestedAt && (
              <p>
                <span className="font-semibold text-gray-700">Submitted:</span>{" "}
                {formatDateTime(profile.paymentRequestedAt)}
              </p>
            )}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            If you submitted by mistake or want to change details, you can
            cancel the request below.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-5 py-2.5 text-sm"
              data-testid="button-back-dashboard"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={busy}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg px-5 py-2.5 text-sm"
              data-testid="button-cancel-payment"
            >
              Cancel request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow">
          <span aria-hidden>🔥</span> 50% OFF — Limited Time
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
          Complete your Premium upgrade
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          One-time payment. No subscriptions. Pay once, use forever.
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl shadow-md p-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
            Total to pay
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold">Rs 299</span>
            <span className="text-base font-semibold text-emerald-200/80 line-through">
              Rs 599
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-100">
            One-time · Lifetime access
          </p>
        </div>
        <div className="text-5xl" aria-hidden>
          👑
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Choose payment method
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Both methods are received on the same Easypaisa number.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod("easypaisa")}
            className={`rounded-xl border-2 p-3 text-left transition-colors ${
              method === "easypaisa"
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            data-testid="method-easypaisa"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-700">Easypaisa</span>
              <span className="text-xl">🟢</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Direct transfer</p>
          </button>
          <button
            type="button"
            onClick={() => setMethod("jazzcash")}
            className={`rounded-xl border-2 p-3 text-left transition-colors ${
              method === "jazzcash"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            data-testid="method-jazzcash"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-700">JazzCash</span>
              <span className="text-xl">🔴</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Send from Jazz to Easypaisa
            </p>
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Send Rs 299 to
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p
                className="text-2xl font-bold text-gray-900 tracking-wider"
                data-testid="text-payment-number"
              >
                {EASYPAISA_NUMBER}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Account title:{" "}
                <span className="font-semibold text-gray-800">
                  Muhammad Zahoor
                </span>{" "}
                (Easypaisa)
              </p>
            </div>
            <button
              type="button"
              onClick={copyNumber}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg px-3 py-2"
              data-testid="button-copy-number"
            >
              {copied ? "✓ Copied" : "Copy number"}
            </button>
          </div>
          {method === "jazzcash" && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
              💡 {JAZZCASH_INSTRUCTION}. JazzCash supports sending money to
              other wallets — choose "Send Money" → "To Other Wallet" →
              Easypaisa, then enter the number above.
            </p>
          )}
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-bold text-gray-900 mb-2">
            How to pay (3 simple steps)
          </h4>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Open your{" "}
                {method === "jazzcash" ? "JazzCash" : "Easypaisa"} app and send{" "}
                <span className="font-bold">Rs 299</span> to the number above.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span>
                Note your transaction ID (TID) from the confirmation message —
                it helps us verify faster.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span>
                Paste the TID below (optional) and tap{" "}
                <span className="font-bold">"I Have Paid"</span>. Our team will
                verify and unlock Premium for you.
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-5">
          <label
            htmlFor="ref"
            className="text-xs font-semibold text-gray-600"
          >
            Transaction ID / Reference{" "}
            <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="ref"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. TID 12345678"
            className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none"
            data-testid="input-reference"
          />
        </div>

        <button
          type="button"
          onClick={handlePaid}
          disabled={busy}
          className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-lg py-3 text-base inline-flex items-center justify-center gap-2 shadow-sm"
          data-testid="button-i-have-paid"
        >
          <span aria-hidden>✓</span>
          {busy ? "Submitting..." : "I Have Paid"}
        </button>
        <p className="mt-2 text-xs text-center text-gray-500">
          We'll verify within a few hours and unlock Premium on your account.
        </p>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => onNavigate("plans")}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Back to plans
        </button>
      </div>
    </div>
  );
}
