import Image from "next/image";
import { Mail, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
        <section className="hidden md:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
            <Image
              src="/re-running-brand.png"
              alt="RE Running"
              fill
              priority
              sizes="520px"
              className="object-cover"
            />
          </div>
        </section>
        <Card className="p-6 md:p-8">
          <Brand />
          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Assessoria premium
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">Entre no seu painel</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Treinos, evolução e mensalidades em uma experiência simples para professor e aluno.
            </p>
          </div>
          <form className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-white">Email</span>
              <input
                type="email"
                placeholder="voce@rerunning.com"
                className="mt-2 h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-white outline-none transition placeholder:text-muted focus:border-primary/60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white">Senha</span>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-2 h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-white outline-none transition placeholder:text-muted focus:border-primary/60"
              />
            </label>
            <Button type="submit" className="w-full">
              <Mail className="h-4 w-4" />
              Entrar
            </Button>
          </form>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm text-muted">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            Supabase Auth preparado para conexao com o projeto.
          </div>
        </Card>
      </div>
    </main>
  );
}
