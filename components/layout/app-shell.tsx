import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, CreditCard, Home, TrendingUp, UsersRound, UserRound } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { cn } from "@/lib/utils";

type NavigationMode = "coach" | "student";

const sidebarItems = {
  coach: [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/coach", label: "Alunos", icon: UsersRound },
    { href: "/training", label: "Treinos", icon: CalendarDays },
    { href: "/financial", label: "Financeiro", icon: CreditCard },
    { href: "/profile", label: "Perfil", icon: UserRound },
  ],
  student: [
    { href: "/student", label: "Início", icon: Home },
    { href: "/student/semana", label: "Semana", icon: CalendarDays },
    { href: "/student/evolucao", label: "Evolução", icon: TrendingUp },
    { href: "/student/mensalidade", label: "Mensalidade", icon: CreditCard },
    { href: "/student/profile", label: "Perfil", icon: UserRound },
  ],
};

export function AppShell({
  title,
  subtitle,
  mode = "coach",
  children,
}: {
  title: string;
  subtitle: string;
  mode?: NavigationMode;
  children: ReactNode;
}) {
  const items = sidebarItems[mode];

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Header title={title} subtitle={subtitle} />
      <div className="mx-auto grid w-full max-w-md gap-6 px-4 py-5 md:max-w-6xl md:grid-cols-[220px_1fr] md:px-6 md:py-8">
        <aside className="hidden md:block">
          <nav className="premium-panel sticky top-24 space-y-1 rounded-3xl p-2">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-muted transition hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
      <BottomNavigation mode={mode} />
    </div>
  );
}
