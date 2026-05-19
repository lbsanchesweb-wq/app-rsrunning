import { AppShell } from "@/components/layout/app-shell";
import { StudentPaymentPanel } from "@/components/financial/student-payment-panel";

export default function StudentPaymentPage() {
  return (
    <AppShell mode="student" title="Mensalidade" subtitle="Status e histórico financeiro da sua assessoria.">
      <StudentPaymentPanel />
    </AppShell>
  );
}
