import { MessageCircle, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CoachCard() {
  return (
    <Card className="p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Seu professor
      </p>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <UserRound className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-white">RS Running Professor</p>
            <Badge>Online</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">Corrida de rua / Meia maratona</p>
        </div>
        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noreferrer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-black shadow-glow transition hover:-translate-y-0.5 hover:bg-secondary active:translate-y-0 active:scale-95"
          aria-label="Chamar professor no WhatsApp"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </Card>
  );
}
