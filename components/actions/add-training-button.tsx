"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Gauge, MessageSquareText, Plus, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function AddTrainingButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setOpen(false);
      showToast("Treino criado");
    }, 650);
  }

  return (
    <>
      <Button
        className={compact ? "h-10 w-10 rounded-2xl px-0 md:w-auto md:px-4" : "h-10 px-3"}
        onClick={() => setOpen(true)}
        aria-label="Adicionar treino"
      >
        <Plus className="h-4 w-4" />
        <span className={compact ? "hidden md:inline" : "hidden sm:inline"}>Novo treino</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar treino</DialogTitle>
            <DialogDescription>
              Defina o treino com clareza para o aluno executar bem.
            </DialogDescription>
          </DialogHeader>
        <form className="grid gap-3" onSubmit={submit}>
          <label className="block">
            <span className="text-sm font-semibold text-white">Tipo</span>
            <select className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-3 text-sm text-white outline-none transition focus:border-primary/60">
              <option>Rodagem leve</option>
              <option>Rodagem moderada</option>
              <option>Fartlek</option>
              <option>Tiros</option>
              <option>Longão</option>
              <option>Rampa</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Route} label="Distância" placeholder="8 km" />
            <Field icon={Gauge} label="Pace" placeholder="5:20/km" />
          </div>
          <Field icon={CalendarDays} label="Dia da semana" placeholder="Terça-feira" />
          <Field icon={MessageSquareText} label="Observação" placeholder="Aquecimento + desaquecimento" />
          <Button type="submit" className="mt-2 rounded-2xl" disabled={saving}>
            {saving ? "Criando..." : "Salvar treino"}
          </Button>
        </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  icon: Icon,
  label,
  placeholder,
}: {
  icon: LucideIcon;
  label: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white">{label}</span>
      <div className="mt-2 flex h-12 items-center gap-2 rounded-2xl border border-border bg-white/[0.05] px-3 transition focus-within:border-primary/60">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        <input
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted"
        />
      </div>
    </label>
  );
}
