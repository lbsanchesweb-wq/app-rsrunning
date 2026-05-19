import { AppShell } from "@/components/layout/app-shell";
import { PaymentCard } from "@/components/financial/payment-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardHeader } from "@/components/ui/card";
import { payments } from "@/lib/data";
import type { PaymentStatus } from "@/lib/types";

const metrics = [
  { label: "Recebido", value: "R$ 6.720", helper: "mês atual" },
  { label: "Pendente", value: "R$ 1.533", helper: "7 alunos" },
  { label: "Atrasado", value: "R$ 438", helper: "2 alunos" },
];

export default async function FinancialPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: PaymentStatus }>;
}) {
  const params = await searchParams;
  const filteredPayments = params?.status
    ? payments.filter((payment) => payment.status === params.status)
    : payments;
  const isFiltered = Boolean(params?.status);

  return (
    <AppShell title="Financeiro" subtitle="Mensalidades simples para manter a assessoria saudável.">
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <Card className="mt-5">
        <CardHeader
          title={isFiltered ? "Mensalidades filtradas" : "Mensalidades"}
          description={
            isFiltered
              ? "Mostrando apenas pendências relevantes para agir agora."
              : "Status de mensalidades e vencimentos próximos."
          }
        />
        <div className="grid gap-3">
          {filteredPayments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
