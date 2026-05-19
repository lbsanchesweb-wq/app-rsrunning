"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BellRing, CalendarDays, CheckCircle2, CreditCard, History } from "lucide-react";
import type { Payment } from "@/lib/types";
import type { PaymentStatus } from "@/lib/types";
import { ActionSheet } from "@/components/ui/action-sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const status = {
  paid: { label: "Pago", className: "border-primary/30 bg-primary/10 text-primary" },
  pending: { label: "Pendente", className: "border-white/15 bg-white/10 text-white" },
  overdue: { label: "Atrasado", className: "border-red-400/30 bg-red-500/10 text-red-200" },
};

export function PaymentCard({ payment }: { payment: Payment }) {
  const [open, setOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus>(payment.status);
  const { showToast } = useToast();
  const current = status[currentStatus];

  function markAsPaid() {
    setCurrentStatus("paid");
    showToast("Mensalidade marcada como paga");
  }

  function notify(message: string) {
    showToast(message);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
      >
        <Card className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-white">{payment.studentName}</h3>
              <p className="text-sm text-muted">Vencimento {payment.dueDate}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white">
              {payment.amount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <Badge className={current.className}>{current.label}</Badge>
          </div>
        </Card>
      </button>
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Mensalidade"
        description={`${payment.studentName} / vencimento ${payment.dueDate}`}
      >
        <div className="mb-4 rounded-2xl bg-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Valor</p>
              <p className="text-2xl font-black text-white">
                {payment.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <Badge className={current.className}>{current.label}</Badge>
          </div>
        </div>
        <div className="grid gap-2">
          <SheetAction icon={CheckCircle2} label="Marcar como pago" onClick={markAsPaid} />
          <SheetAction icon={BellRing} label="Enviar lembrete" onClick={() => notify("Lembrete enviado")} />
          <SheetAction
            icon={CalendarDays}
            label="Alterar vencimento"
            onClick={() => notify("Vencimento atualizado")}
          />
          <SheetAction icon={History} label="Ver histórico" onClick={() => notify("Histórico aberto")} />
        </div>
      </ActionSheet>
    </>
  );
}

function SheetAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.06] p-4 text-left font-semibold text-white transition hover:bg-white/[0.09] active:scale-[0.99]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
      </span>
      {label}
    </button>
  );
}
