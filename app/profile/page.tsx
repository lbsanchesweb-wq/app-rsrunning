import type { LucideIcon } from "lucide-react";
import { ExternalLink, Instagram, MessageCircle, QrCode, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileSaveButton } from "@/components/profile/profile-save-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";

const specialties = ["5K e 10K", "Meia maratona", "Retorno pós-lesão", "Base aeróbica"];

export default function ProfilePage() {
  return (
    <AppShell title="Perfil" subtitle="Perfil profissional, dados públicos e chave Pix.">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <div className="flex items-start gap-4">
            <AvatarUpload label="Enviar foto do professor" size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">Professor responsável</p>
              <h1 className="mt-1 text-2xl font-black text-white">RS Running Professor</h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Assessoria de corrida com foco em consistência, performance segura e evolução de longo prazo.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Info label="CREF" value="123456-G/SP" />
            <Info label="Experiência" value="8 anos" />
            <Info label="Alunos ativos" value="42" />
            <Info label="Provas acompanhadas" value="180+" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {specialties.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ProfileLink href="https://wa.me/5500000000000" label="WhatsApp" icon={MessageCircle} tone="primary" />
            <ProfileLink href="https://instagram.com" label="Instagram" icon={Instagram} tone="secondary" />
            <ProfileLink href="https://rsrunning.com.br" label="Site" icon={ExternalLink} tone="outline" />
          </div>
        </Card>

        <Card>
            <CardHeader
              title="Perfil profissional"
            description="Informações exibidas no app dos alunos."
            action={<Trophy className="h-5 w-5 text-primary" />}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome público" defaultValue="Rui Sanches" />
            <Field label="Nome da assessoria" defaultValue="RS Running" />
            <Field label="Mini bio" defaultValue="Treinador de corrida de rua e performance amadora." wide />
            <Field label="CREF" defaultValue="123456-G/SP" />
            <Field label="Tempo de experiência" defaultValue="8 anos" />
            <Field label="WhatsApp" defaultValue="(11) 99999-9999" />
            <Field label="Instagram" defaultValue="@rsrunning" />
            <Field label="Especialidades" defaultValue="5K, 10K, meia maratona e base aeróbica" wide />
          </div>
          <ProfileSaveButton />
        </Card>

        <Card className="lg:col-start-2">
          <CardHeader
            title="Pagamentos"
            description="Chave Pix exibida para alunos com mensalidade em aberto."
            action={<QrCode className="h-5 w-5 text-primary" />}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo da chave Pix" defaultValue="Telefone" />
            <Field label="Chave Pix" defaultValue="11999999999" />
            <Field label="Nome do recebedor" defaultValue="Rui Sanches" />
            <Field label="Banco/conta" defaultValue="Nubank" />
            <Field
              label="Mensagem para o aluno"
              defaultValue="Após pagar, aguarde a conferência do professor para atualização do status."
              wide
            />
          </div>
          <ProfileSaveButton label="Salvar dados de pagamento" />
        </Card>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function ProfileLink({
  href,
  label,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  tone: "primary" | "secondary" | "outline";
}) {
  const styles = {
    primary: "bg-primary text-black hover:bg-secondary",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    outline: "border border-border bg-transparent text-white hover:border-primary/60",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${styles[tone]} inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </a>
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
