"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Route } from "lucide-react";
import type { TrainingSession } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const statusLabel = {
  scheduled: "Programado",
  done: "Concluído",
  missed: "Perdido",
};

export function TrainingCard({ session }: { session: TrainingSession }) {
  const [status, setStatus] = useState(session.status);
  const { showToast } = useToast();
  const isDone = status === "done";

  function completeTraining() {
    if (isDone) return;
    setStatus("done");
    showToast("Treino concluído");
  }

  return (
    <Card
      className={cn(
        "p-5 transition duration-300",
        isDone && "border-primary/35 bg-primary/[0.08]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {session.day} / {session.date}
          </p>
          <h3 className="mt-3 text-xl font-black text-white">{session.title}</h3>
          <p className="mt-1 text-sm font-medium text-muted">{session.type}</p>
        </div>
        <Badge className={isDone ? "border-primary/35 bg-primary text-black" : undefined}>
          {isDone ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : null}
          {statusLabel[status]}
        </Badge>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-2">
          <Route className="h-4 w-4 text-primary" aria-hidden />
          {session.distanceKm} km
        </span>
        {session.pace ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-2">
            <Clock3 className="h-4 w-4 text-primary" aria-hidden />
            {session.pace}
          </span>
        ) : null}
      </div>
      <Button
        className="mt-5 w-full rounded-2xl"
        variant={isDone ? "secondary" : "primary"}
        onClick={completeTraining}
      >
        <CheckCircle2 className="h-4 w-4" />
        {isDone ? "Treino concluído" : "Marcar como concluído"}
      </Button>
    </Card>
  );
}
