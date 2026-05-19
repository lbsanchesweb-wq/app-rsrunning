import type { TrainingSession } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { TrainingCard } from "@/components/training/training-card";
import { EmptyState } from "@/components/ui/empty-state";

export function WeeklySchedule({ sessions }: { sessions: TrainingSession[] }) {
  return (
    <Card>
      <CardHeader
        title="Semana"
        description="Treinos organizados por dia com foco no objetivo atual."
      />
      {sessions.length === 0 ? (
        <EmptyState
          title="Semana sem treinos"
          description="Crie um treino para preencher a semana."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {sessions.map((session) => (
            <TrainingCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </Card>
  );
}
