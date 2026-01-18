import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "../services/auth";
import {
  ChartBar,
  Package,
  CurrencyDollar,
  Calculator,
  Timer,
  ClockCounterClockwise,
  SignOut,
  Cactus,
} from "phosphor-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { path: "/", label: "Dashboard", Icon: ChartBar },
    { path: "/stocks", label: "Stocks", Icon: Package },
    { path: "/prices", label: "Prix", Icon: CurrencyDollar },
    { path: "/calculator", label: "Calculateur", Icon: Calculator },
    { path: "/timers", label: "Transformations", Icon: Timer },
    { path: "/history", label: "Historique", Icon: ClockCounterClockwise },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card sticky top-0 z-10 border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-peach flex gap-2 items-center">              <Cactus size={24} weight="duotone" />
 Brewsy </h1>
          <div className="flex items-center gap-3">
            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-soft hover:bg-surface transition-colors text-text-secondary"
              title="Déconnexion"
            >
              <SignOut size={24} weight="duotone" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 glass-strong p-4 hidden md:block border-r border-border shadow-glass">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-soft transition-colors ${
                    isActive(item.path)
                      ? "bg-sky text-peach-dark font-semibold shadow-glass"
                      : "text-text-muted hover:glass"
                  }`}
                >
                  <item.Icon
                    size={24}
                    weight={isActive(item.path) ? "fill" : "duotone"}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden glass-strong sticky bottom-0 border-t border-border shadow-glass">
        <ul className="flex justify-around py-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-soft transition-colors ${
                  isActive(item.path)
                    ? "text-sky font-semibold"
                    : "text-text-muted"
                }`}
              >
                <item.Icon
                  size={24}
                  weight={isActive(item.path) ? "fill" : "duotone"}
                />
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
