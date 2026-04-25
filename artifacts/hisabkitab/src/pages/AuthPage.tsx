import { useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/firebase/auth";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
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
          <div className="flex bg-emerald-50 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
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
              onClick={() => setMode("signup")}
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
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

            {error && (
              <div
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3"
                data-testid="text-auth-error"
              >
                {error}
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
                  : "Create account"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Your data stays private to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
