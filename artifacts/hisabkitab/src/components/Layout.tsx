import { useState, type ReactNode } from "react";
import { Sidebar, type PageId } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { AdSlot } from "@/components/AdSlot";

type Props = {
  active: PageId;
  onNavigate: (id: PageId) => void;
  isPremium: boolean;
  unreadCount: number;
  children: ReactNode;
};

export function Layout({
  active,
  onNavigate,
  isPremium,
  unreadCount,
  children,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        active={active}
        onNavigate={onNavigate}
        isPremium={isPremium}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          onMenu={() => setMenuOpen(true)}
          onNavigate={onNavigate}
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-screen-2xl w-full mx-auto">
          {children}
        </main>
        {!isPremium && (
          <footer className="px-4 sm:px-6 pb-6 max-w-screen-2xl w-full mx-auto">
            <AdSlot slot="2850967188" isPremium={isPremium} />
          </footer>
        )}
      </div>
    </div>
  );
}
