"use client";

import { useState } from "react";
import { Activity, CalendarCheck, Route, UserRound, WalletCards } from "lucide-react";
import type { Payment, Student, TrainingSession } from "@/lib/types";
import { ActionSheet } from "@/components/ui/action-sheet";
import { Badge } from "@/components/ui/badge";

type ActionKind = "trainings" | "checkins" | "payments";

export function TodayActions({
  sessions,
  students,
  pendingPayments,
}: {
  sessions: TrainingSession[];
  students: Student[];
  pendingPayments: Payment[];
}) {
  const [active, setActive] = useState<ActionKind | null>(null);

  const items = [
    { kind: "trainings" as const, icon: Activity, label: "Treinos do dia", value: `${sessions.length}` },
    { kind: "checkins" as const, icon: CalendarCheck, label: "Check-ins recebidos", value: "26" },
    { kind: "payments" as const, icon: WalletCards, label: "Mensalidades pendentes", value: `${pendingPayments.length}` },
  ];

  return (
    <>
      <div className="grid gap-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.kind}
              type="button"
              onClick={() => setActive(item.kind)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.06] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.09] active:translate-y-0 active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-lg font-black text-white">{item.value}</p>
                <p className="text-sm text-muted">{item.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      <ActionSheet
        open={active === "trainings"}
        onClose={() => setActive(null)}
        title="Treinos do dia"
        description="Sessões que merecem acompanhamento agora."
      >
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between rounded-2xl bg-white/[0.06] p-3">
              <div>
                <p className="font-semibold text-white">{session.title}</p>
                <p className="text-sm text-muted">{session.type} / {session.distanceKm} km</p>
              </div>
              <Badge>{session.status === "done" ? "Concluído" : "Programado"}</Badge>
            </div>
          ))}
        </div>
      </ActionSheet>

      <ActionSheet
        open={active === "checkins"}
        onClose={() => setActive(null)}
        title="Check-ins recebidos"
        description="Alunos que registraram treino ou sensação recentemente."
      >
        <div className="space-y-2">
          {students.slice(0, 3).map((student) => (
            <div key={student.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <UserRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-white">{student.name}</p>
                <p className="text-sm text-muted">Registrou evolução da semana</p>
              </div>
            </div>
          ))}
        </div>
      </ActionSheet>

      <ActionSheet
        open={active === "payments"}
        onClose={() => setActive(null)}
        title="Mensalidades pendentes"
        description="Pendências financeiras que precisam de atenção."
      >
        <div className="space-y-2">
          {pendingPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between rounded-2xl bg-white/[0.06] p-3">
              <div>
                <p className="font-semibold text-white">{payment.studentName}</p>
                <p className="text-sm text-muted">Vencimento {payment.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-white">
                  {payment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <Badge className={payment.status === "overdue" ? "border-red-400/30 bg-red-500/10 text-red-200" : undefined}>
                  {payment.status === "overdue" ? "Atrasado" : "Pendente"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ActionSheet>
    </>
  );
}
