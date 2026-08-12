import Image from "next/image";
import Link from "next/link";

export function AuthBrandPanel() {
  return (
    <section
      className="
        relative hidden
        overflow-hidden
        lg:flex lg:w-[46%]
        lg:flex-col
        lg:justify-between
        bg-brand-brown-950
        p-10
        xl:p-14
      "
    >
      {/* Decorative circles */}
      <div
        className="
          pointer-events-none absolute
          -right-32 -top-32
          h-96 w-96
          rounded-full
          bg-brand-desert/10
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-40 -left-40
          h-[28rem] w-[28rem]
          rounded-full
          border border-brand-desert/10
        "
      />

      {/* Brand */}
      <div className="relative">

        <Link
          href="/"
          className="inline-flex items-center gap-3"
        >
          <div
            className="
              flex h-11 w-11
              items-center justify-center
              overflow-hidden
              rounded-xl
              bg-brand-desert
            "
          >
            <Image
              src="/logo.png"
              alt="Platform"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
          </div>

          <span className="text-lg font-bold tracking-tight text-white">
            Commons
          </span>
        </Link>

      </div>

      {/* Main message */}
      <div className="relative max-w-lg">

        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-brand-desert
          "
        >
          A home for every interest
        </p>

        <h1
          className="
            mt-5
            text-4xl
            font-bold
            leading-[1.08]
            tracking-[-0.04em]
            text-white
            xl:text-5xl
          "
        >
          Join the people
          <br />
          building something
          <br />
          that lasts.
        </h1>

        <p
          className="
            mt-6
            max-w-md
            text-sm
            leading-7
            text-white/60
          "
        >
          Discover communities, exchange ideas, contribute knowledge,
          and help shape the digital institutions that belong to everyone.
        </p>

        {/* Principles */}
        <div className="mt-9 space-y-4">

          <Principle
            number="01"
            title="One home"
            description="Every enduring interest has one canonical community."
          />

          <Principle
            number="02"
            title="Shared ownership"
            description="Communities belong to the people who contribute to them."
          />

          <Principle
            number="03"
            title="Knowledge that lasts"
            description="Great contributions can become part of a community's history."
          />

        </div>

      </div>

      {/* Footer */}
      <p className="relative text-[10px] text-white/35">
        Every interest deserves a home.
      </p>

    </section>
  );
}

function Principle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">

      <span className="pt-0.5 text-[10px] font-bold text-brand-desert">
        {number}
      </span>

      <div>
        <h3 className="text-xs font-bold text-white">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] leading-5 text-white/45">
          {description}
        </p>
      </div>

    </div>
  );
}