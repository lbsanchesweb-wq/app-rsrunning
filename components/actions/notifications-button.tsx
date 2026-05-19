"use client";

import { useState } from "react";
import { Bell, CalendarClock, CheckCircle2, CreditCard, Route, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { RaceDetailsSheet } from "@/components/dashboard/race-card";
import { StudentDetailsSheet } from "@/components/student/student-card";
import { ActionSheet } from "@/components/ui/action-sheet";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { payments, students, weeklySessions } from "@/lib/data";

type NotificationKind = "student" | "finance" | "training" | "race";

const notifications = [
  {
    kind: "student" as const,
    icon: UserX,
    title: "Aluno sem treino há 5 dias",
    description: "Rafael Lima precisa de acompanhamento.",
  },
  {
    kind: "finance" as const,
    icon: CreditCard,
    title: "Mensalidade atrasada",
    description: "Beatriz Nunes está com vencimento em aberto.",
  },
  {
    kind: "training" as const,
    icon: CheckCircle2,
    title: "Treino concluído",
    description: "Marina Costa registrou sensação leve.",
  },
  {
    kind: "race" as const,
    icon: CalendarClock,
    title: "Prova próxima",
    description: "SP City 21K entra na fase de ajuste final.",
  },
];

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<NotificationKind | null>(null);
  const router = useRouter();
  const targetStudent = students[1];
  const raceStudent = students[0];
  const training = weeklySessions[0];
  const overduePayments = payments.filter((payment) => payment.status === "overdue");

  function handleAction(kind: NotificationKind) {
    setOpen(false);

    if (kind === "finance") {
      router.push("/financial?status=overdue");
      return;
    }

    setActive(kind);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:translate-y-0 active:scale-95 md:hidden"
        aria-label="Abrir notificações"
      >
        <Bell className="h-4 w-4" aria-hidden />
        <CountBadge />
      </button>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative hidden h-10 w-10 items-center justify-center rounded-2xl text-muted transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:translate-y-0 active:scale-95 md:inline-flex"
            aria-label="Abrir notificações"
          >
            <Bell className="h-4 w-4" aria-hidden />
            <CountBadge />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96">
          <div className="mb-4">
            <h2 className="text-lg font-black text-white">Notificações</h2>
            <p className="text-sm leading-6 text-muted">Sinais importantes para agir rápido hoje.</p>
          </div>
          <NotificationList onAction={handleAction} />
        </PopoverContent>
      </Popover>

      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Notificações"
        description="Sinais importantes para agir rápido hoje."
      >
        <NotificationList onAction={handleAction} />
      </ActionSheet>

      <StudentDetailsSheet
        student={targetStudent}
        open={active === "student"}
        onOpenChange={(nextOpen) => setActive(nextOpen ? "student" : null)}
      />
      <RaceDetailsSheet
        student={raceStudent}
        open={active === "race"}
        onOpenChange={(nextOpen) => setActive(nextOpen ? "race" : null)}
      />
      <ActionSheet
        open={active === "training"}
        onClose={() => setActive(null)}
        title={training.title}
        description="Detalhes do treino concluído"
      >
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Info icon={Route} label="Distância" value={`${training.distanceKm} km`} />
            <Info icon={CheckCircle2} label="Status" value="Concluído" />
          </div>
          <div className="rounded-2xl bg-white/[0.06] p-4">
            <p className="text-sm font-semibold text-white">Feedback</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Sensação leve registrada. Boa execução para manter a sequência da semana.
            </p>
          </div>
        </div>
      </ActionSheet>
      <ActionSheet
        open={active === "finance"}
        onClose={() => setActive(null)}
        title="Mensalidades atrasadas"
        description="Pendências financeiras em aberto."
      >
        <div className="space-y-2">
          {overduePayments.map((payment) => (
            <div key={payment.id} className="rounded-2xl bg-white/[0.06] p-4">
              <p className="font-semibold text-white">{payment.studentName}</p>
              <p className="text-sm text-muted">Vencimento {payment.dueDate}</p>
            </div>
          ))}
        </div>
      </ActionSheet>
    </>
  );
}

function CountBadge() {
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-black">
      {notifications.length}
    </span>
  );
}

function NotificationList({ onAction }: { onAction: (kind: NotificationKind) => void }) {
  return (
    <div className="space-y-3">
      {notifications.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.title}
            type="button"
            onClick={() => onAction(item.kind)}
            className="flex w-full items-start gap-3 rounded-2xl bg-white/[0.06] p-4 text-left transition hover:bg-white/[0.09] active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-white">{item.title}</p>
                <Badge className="shrink-0">Abrir</Badge>
              </div>
              <p className="mt-1 text-sm leading-5 text-muted">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Route;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4">
      <Icon className="mb-2 h-4 w-4 text-primary" />
      <p className="font-black text-white">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
