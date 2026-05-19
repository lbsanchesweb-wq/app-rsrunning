import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-2xl border border-primary/25 bg-black/70 p-1 shadow-glow">
        <Image
          src="/re-running-brand.png"
          alt="RE Running"
          fill
          sizes="56px"
          className="object-contain p-1"
          priority
        />
      </div>
      {!compact ? (
        <div className="leading-none">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
            RE
          </p>
          <p className="mt-1 text-base font-bold text-white">Running</p>
        </div>
      ) : null}
    </div>
  );
}
