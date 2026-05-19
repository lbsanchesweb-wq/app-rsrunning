"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Mail, Phone, Plus, Target, UserRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function AddStudentButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setOpen(false);
      showToast("Aluno adicionado");
    }, 650);
  }

  return (
    <>
      <Button
        className={compact ? "h-10 w-10 rounded-2xl px-0 md:w-auto md:px-4" : "h-10 px-3"}
        onClick={() => setOpen(true)}
        aria-label="Adicionar aluno"
      >
        <Plus className="h-4 w-4" />
        <span className={compact ? "hidden md:inline" : "hidden sm:inline"}>Novo aluno</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar aluno</DialogTitle>
            <DialogDescription>
              Cadastre o essencial para começar o acompanhamento.
            </DialogDescription>
          </DialogHeader>
        <form className="grid gap-3" onSubmit={submit}>
          <Field icon={UserRound} label="Nome" placeholder="Nome completo" required />
          <Field icon={Mail} label="Email" placeholder="aluno@email.com" type="email" required />
          <Field icon={Phone} label="Telefone" placeholder="(11) 99999-9999" />
          <Field icon={Target} label="Objetivo" placeholder="Meia maratona sub 2h" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Volume semanal" placeholder="32 km" />
            <Field label="Prova alvo" placeholder="SP City 21K" />
          </div>
          <Field icon={WalletCards} label="Valor mensalidade" placeholder="R$ 249,00" />
          <Button type="submit" className="mt-2 rounded-2xl" disabled={saving}>
            {saving ? "Salvando..." : "Salvar aluno"}
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
  type = "text",
  required,
}: {
  icon?: LucideIcon;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white">{label}</span>
      <div className="mt-2 flex h-12 items-center gap-2 rounded-2xl border border-border bg-white/[0.05] px-3 transition focus-within:border-primary/60">
        {Icon ? <Icon className="h-4 w-4 text-primary" aria-hidden /> : null}
        <input
          type={type}
          placeholder={placeholder}
          required={required}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted"
        />
      </div>
    </label>
  );
}
