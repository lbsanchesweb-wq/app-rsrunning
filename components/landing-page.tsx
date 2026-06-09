"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  Activity,
  Apple,
  CalendarDays,
  Chrome,
  Clock3,
  MessageCircle,
  PlusSquare,
  Smartphone,
  Trophy,
  Zap
} from "lucide-react";

const appUrl = "https://app-rsrunning.vercel.app/student";

const benefits = [
  {
    icon: CalendarDays,
    title: "Treinos organizados",
    description: "Veja seus treinos do dia de forma simples e rápida."
  },
  {
    icon: Activity,
    title: "Evolução em tempo real",
    description: "Acompanhe volume, frequência e progresso semanal."
  },
  {
    icon: MessageCircle,
    title: "Contato com professor",
    description: "Mais proximidade e acompanhamento da assessoria."
  },
  {
    icon: Smartphone,
    title: "Experiência de aplicativo",
    description: "Instale no celular como um app real."
  }
];

const installSteps = [
  {
    icon: Smartphone,
    label: "Passo 1",
    title: "Acesse o app pelo navegador do celular"
  },
  {
    icon: PlusSquare,
    label: "Passo 2",
    title: "Toque em 'Adicionar à tela inicial'"
  },
  {
    icon: Zap,
    label: "Passo 3",
    title: "Pronto. O RS Running funcionará como aplicativo."
  }
];

const compatibility = [
  { icon: Smartphone, label: "Android" },
  { icon: Apple, label: "iPhone" },
  { icon: Chrome, label: "Chrome" },
  { icon: Clock3, label: "Safari" }
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

export function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="particle-field" />
      <div className="noise-layer" />

      <Nav />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-14 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-8 flex w-fit items-center gap-3 rounded-full border border-acid/25 bg-acid/8 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-acid shadow-acid-soft">
            <span className="h-2 w-2 rounded-full bg-acid shadow-[0_0_18px_rgba(198,255,26,0.85)]" />
            Beta exclusivo para alunos convidados
          </div>

          <Image
            src="/rs-running-logo-beta.png"
            alt="Logo SR Running Beta"
            width={420}
            height={280}
            priority
            className="mb-8 h-20 w-full max-w-[19rem] rounded-[8px] object-cover object-center sm:h-24 sm:max-w-sm"
          />

          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Seu treino agora vai com você.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300 sm:text-lg">
            Acompanhe seus treinos, evolução e cronograma diretamente pelo app da
            RS Running.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={appUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-acid px-7 text-sm font-black uppercase text-black shadow-[0_0_42px_rgba(198,255,26,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_54px_rgba(198,255,26,0.38)]"
            >
              Acessar app
            </a>
            <a
              href="#como-instalar"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/[0.04] px-7 text-sm font-bold uppercase text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-acid/40 hover:text-acid"
            >
              Como instalar
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-2xl lg:max-w-none"
        >
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial-acid blur-3xl sm:h-[34rem] sm:w-[34rem]"
            animate={reduceMotion ? undefined : { opacity: [0.46, 0.78, 0.46] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            animate={reduceMotion ? undefined : { y: [-10, 12, -10] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Image
              src="/rs-running-hero-mockup.png"
              alt="Mockup do celular com o app RS Running"
              width={1536}
              height={1024}
              priority
              className="relative z-10 h-auto w-full rounded-[8px] object-contain drop-shadow-[0_42px_90px_rgba(0,0,0,0.65)]"
            />
          </motion.div>
        </motion.div>
      </section>

      <Section id="beneficios" eyebrow="Benefícios" title="Tudo que importa, sem ruído.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => (
            <MotionCard key={item.title} delay={index * 0.06}>
              <item.icon className="h-6 w-6 text-acid" strokeWidth={1.8} />
              <h3 className="mt-7 text-xl font-extrabold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
            </MotionCard>
          ))}
        </div>
      </Section>

      <Section
        id="como-instalar"
        eyebrow="Como instalar"
        title="Visual de app. Instalação simples."
        description="Abra pelo celular e adicione o RS Running à tela inicial para acessar como um aplicativo."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {installSteps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="glass-panel relative overflow-hidden rounded-[8px] p-6"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-acid/10 blur-2xl" />
              <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-acid text-black shadow-acid-soft">
                <step.icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-acid">
                {step.label}
              </p>
              <h3 className="mt-3 text-lg font-extrabold leading-7 text-white">
                {step.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </Section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
          className="glass-panel flex flex-col gap-7 rounded-[8px] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-acid">
              Compatibilidade
            </p>
            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
              Compatível com os principais dispositivos modernos.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {compatibility.map((item) => (
              <div
                key={item.label}
                className="flex min-h-24 min-w-28 flex-col items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.035] px-5 text-center"
              >
                <item.icon className="h-6 w-6 text-acid" strokeWidth={1.8} />
                <span className="mt-3 text-sm font-bold text-zinc-200">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-5xl px-5 py-20 text-center sm:px-8 lg:px-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65 }}
          className="relative overflow-hidden rounded-[8px] border border-acid/20 bg-[linear-gradient(145deg,rgba(198,255,26,0.12),rgba(255,255,255,0.035)_42%,rgba(198,255,26,0.08))] px-6 py-14 shadow-acid-card sm:px-12"
        >
          <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-acid/20 blur-3xl" />
          <Trophy className="relative mx-auto h-8 w-8 text-acid" strokeWidth={1.8} />
          <h2 className="relative mt-6 text-3xl font-black text-white sm:text-5xl">
            Pronto para sua próxima evolução?
          </h2>
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="relative mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-acid px-8 text-sm font-black uppercase text-black shadow-[0_0_50px_rgba(198,255,26,0.32)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(198,255,26,0.42)]"
          >
            Entrar no app
          </a>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/8 px-5 py-8 text-center text-sm text-zinc-500">
        RS Running © 2026
      </footer>
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/8 bg-ink/72 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/rs-running-logo-beta.png"
            alt="RS Running"
            width={156}
            height={104}
            priority
            className="h-10 w-40 rounded-[6px] object-cover object-center"
          />
        </a>
        <a
          href={appUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden min-h-11 items-center justify-center rounded-full border border-acid/35 bg-acid/10 px-5 text-xs font-black uppercase text-acid transition duration-300 hover:bg-acid hover:text-black sm:inline-flex"
        >
          Acessar app
        </a>
        <a
          href={appUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Acessar app"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-acid text-black shadow-acid-soft sm:hidden"
        >
          <Smartphone className="h-5 w-5" />
        </a>
      </nav>
    </header>
  );
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6 }}
        className="mb-9 max-w-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-acid">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-base leading-7 text-zinc-400">{description}</p>
        ) : null}
      </motion.div>
      {children}
    </section>
  );
}

function MotionCard({
  children,
  delay
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -6, borderColor: "rgba(198,255,26,0.34)" }}
      className="glass-panel group relative min-h-56 overflow-hidden rounded-[8px] p-6 transition-colors"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-acid/0 blur-2xl transition duration-500 group-hover:bg-acid/12" />
      <div className="relative">{children}</div>
    </motion.article>
  );
}
