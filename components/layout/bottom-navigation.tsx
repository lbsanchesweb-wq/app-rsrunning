"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, CreditCard, Home, TrendingUp, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

type NavigationMode = "coach" | "student";

const navigation = {
  coach: [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/coach", label: "Alunos", icon: UsersRound },
    { href: "/training", label: "Treinos", icon: CalendarDays },
    { href: "/financial", label: "Financeiro", icon: CreditCard },
    { href: "/profile", label: "Perfil", icon: UserRound },
  ],
  student: [
    { href: "/student", label: "Início", icon: Home },
    { href: "/student#semana", label: "Semana", icon: CalendarDays },
    { href: "/student#evolucao", label: "Evolução", icon: TrendingUp },
    { href: "/student#mensalidade", label: "Mensalidade", icon: CreditCard },
    { href: "/profile", label: "Perfil", icon: UserRound },
  ],
};

export function BottomNavigation({ mode = "coach" }: { mode?: NavigationMode }) {
  const pathname = usePathname();
  const items = navigation[mode];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.75rem] border border-white/[0.08] bg-card/90 p-1.5 shadow-card backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (mode === "student" && item.href === "/student" && pathname === "/student");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold text-muted transition",
                active && "bg-primary text-black shadow-glow",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
