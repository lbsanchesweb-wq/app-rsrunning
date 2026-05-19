"use client";

import { useState } from "react";
import { Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function StudentProfileEditButton() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function saveProfile() {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setOpen(false);
      showToast("Perfil do aluno atualizado");
    }, 600);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-5 w-full rounded-2xl">
          <Pencil className="h-4 w-4" />
          Editar perfil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil do aluno</DialogTitle>
          <DialogDescription>
            Cadastre as informações pessoais e esportivas que ajudam o professor a acompanhar sua evolução.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" defaultValue="Marina Costa" />
          <Field label="Telefone" defaultValue="(11) 98888-7777" />
          <Field label="Data de nascimento" defaultValue="12/08/1992" />
          <Field label="Cidade" defaultValue="São Paulo" />
          <Field label="Objetivo principal" defaultValue="Meia maratona sub 2h" wide />
          <Field label="Volume atual" defaultValue="32 km por semana" />
          <Field label="Pace confortável" defaultValue="6:10/km" />
          <Field label="Observações de saúde" defaultValue="Sem restrições atuais" wide />
        </div>
        <Button className="w-full rounded-2xl" onClick={saveProfile} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar informações"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  defaultValue,
  wide,
}: {
  label: string;
  defaultValue: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "block sm:col-span-2" : "block"}>
      <span className="text-sm font-semibold text-white">{label}</span>
      <input
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full rounded-2xl border border-border bg-white/[0.05] px-4 text-sm text-white outline-none transition focus:border-primary/60"
      />
    </label>
  );
}
