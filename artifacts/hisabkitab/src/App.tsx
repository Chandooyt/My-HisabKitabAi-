import { AuthProvider, useAuth } from "@/firebase/auth";
import { ConfigWarning } from "@/components/ConfigWarning";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";

function AppShell() {
  const { user, loading, configured } = useAuth();

  if (!configured) return <ConfigWarning />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-emerald-700 font-semibold">Loading...</div>
      </div>
    );
  }

  return user ? <DashboardPage /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
