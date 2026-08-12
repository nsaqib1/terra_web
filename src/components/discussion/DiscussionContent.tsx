interface DiscussionContentProps {
  children: React.ReactNode;
}

export function DiscussionContent({
  children,
}: DiscussionContentProps) {
  return (
    <section className="rounded-2xl border bg-white p-5 sm:p-7">

      <div className="mb-5">
        <span
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-brand-desert-dark
          "
        >
          Discussion
        </span>
      </div>

      <div
        className="
          max-w-3xl
          text-sm
          leading-7
          text-brand-brown-700
        "
      >
        {children}
      </div>

    </section>
  );
}