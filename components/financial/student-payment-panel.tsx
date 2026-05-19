"use client";

import { CheckCircle2, Clipboard, Clock3, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

const pixKey = "11999999999";

const paidHistory = [
  { month: "Abril 2026", amount: "R$ 249,00", paidAt: "18 abr" },
  { month: "Março 2026", amount: "R$ 249,00", paidAt: "20 mar" },
  { month: "Fevereiro 2026", amount: "R$ 249,00", paidAt: "19 fev" },
];

export function StudentPaymentPanel() {
  const { showToast } = useToast();

  async function copyPixKey() {
    await navigator.clipboard.writeText(pixKey);
    showToast("Chave Pix copiada");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-primary/20">
        <CardHeader
          title="Mensalidade em aberto"
          description="Após o pagamento, aguarde a confirmação do professor."
          action={<Badge className="border-white/15 bg-white/10 text-white">Pendente</Badge>}
        />
        <div className="rounded-[1.75rem] bg-white/[0.06] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Maio 2026</p>
              <p className="mt-1 text-3xl font-black text-white">R$ 249,00</p>
              <p className="mt-2 text-sm text-muted">Vencimento em 20 mai</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <WalletCards className="h-6 w-6" aria-hidden />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.75rem] border border-border bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Chave Pix</p>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] p-3">
            <code className="min-w-0 truncate text-sm font-semibold text-white">{pixKey}</code>
            <Button className="shrink-0 rounded-2xl" onClick={copyPixKey}>
              <Clipboard className="h-4 w-4" />
              Copiar
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-primary/10 p-4">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p className="text-sm leading-6 text-muted">
            O status será atualizado pelo professor após a conferência do pagamento.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Histórico de pagamentos" description="Mensalidades já confirmadas pelo professor." />
        <div className="grid gap-3">
          {paidHistory.map((payment) => (
            <div key={payment.month} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{payment.month}</p>
                  <p className="text-sm text-muted">Pago em {payment.paidAt}</p>
                </div>
              </div>
              <p className="shrink-0 font-bold text-white">{payment.amount}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
