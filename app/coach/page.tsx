import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StudentCard } from "@/components/student/student-card";
import { AddStudentButton } from "@/components/actions/add-student-button";
import { Card, CardHeader } from "@/components/ui/card";
import { coachMetrics, students } from "@/lib/data";

export default function CoachPage() {
  return (
    <AppShell title="Alunos" subtitle="Acompanhe objetivos, evolução e consistência.">
      <div className="grid gap-3 sm:grid-cols-3">
        {coachMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <Card className="mt-5">
        <CardHeader
          title="Alunos ativos"
          description="Acompanhamento rápido de objetivos, volume e consistência."
          action={<AddStudentButton />}
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
