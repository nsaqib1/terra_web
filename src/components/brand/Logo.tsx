import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 shrink-0"
      aria-label="Home"
    >
      <Image
        src="/logo.png"
        alt="Platform logo"
        width={44}
        height={44}
        className="h-10 w-10 object-contain"
        priority
      />

      {!compact && (
        <div className="leading-none">
          <span className="block text-[19px] font-bold tracking-[-0.035em] text-brand-brown-950">
            Commons
          </span>

          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-brown-600">
            Every interest has a home
          </span>
        </div>
      )}
    </Link>
  );
}