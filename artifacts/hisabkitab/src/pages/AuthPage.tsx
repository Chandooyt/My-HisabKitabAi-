import { useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/firebase/auth";

export function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const switchMode = (next: "login" | "signup" | "reset") => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "reset") {
      if (!email.trim()) {
        setError("Please enter your email.");
        return;
      }
      setBusy(true);
      try {
        await resetPassword(email.trim());
        setInfo(
          `We sent a password reset link to ${email.trim()}. Check your inbox (and spam folder).`,
        );
        setPassword("");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message.replace("Firebase: ", ""));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-6 sm:p-8">
          {mode !== "reset" ? (
            <div className="flex bg-emerald-50 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-emerald-600/70"
                }`}
                data-testid="tab-login"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-emerald-600/70"
                }`}
                data-testid="tab-signup"
              >
                Sign up
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-emerald-700">
                Reset password
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Enter the email you signed up with. We'll send a reset link
                straight to your inbox.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="you@example.com"
                autoComplete="email"
                data-testid="input-email"
              />
            </div>
            {mode !== "reset" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("reset")}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      data-testid="link-forgot-password"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="At least 6 characters"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  data-testid="input-password"
                />
              </div>
            )}

            {error && (
              <div
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3"
                data-testid="text-auth-error"
              >
                {error}
              </div>
            )}

            {info && (
              <div
                className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3"
                data-testid="text-auth-info"
              >
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-lg py-3 text-base transition shadow-sm"
              data-testid="button-submit"
            >
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </button>

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                data-testid="button-back-to-login"
              >
                ← Back to log in
              </button>
            )}
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Your data stays private to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
