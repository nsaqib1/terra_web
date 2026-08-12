import {
  CheckCircle2,
  Hash,
  Info,
  ShieldCheck,
} from "lucide-react";

interface ProposalStepReviewProps {
  name: string;
  description: string;
  scope: string;
  tags: string[];
}

export function ProposalStepReview({
  name,
  description,
  scope,
  tags,
}: ProposalStepReviewProps) {
  return (
    <div className="space-y-7">

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-desert-dark">
          Step 4
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-brown-950">
          Review your proposal
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-brand-brown-600">
          Make sure the community represents a clear, enduring subject
          before sending it to platform review.
        </p>
      </div>

      {/* Preview */}
      <section className="overflow-hidden rounded-2xl border bg-white">

        <div className="h-2 bg-brand-desert" />

        <div className="p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <div
              className="
                flex h-14 w-14 shrink-0
                items-center justify-center
                rounded-xl
                bg-brand-desert-light
                text-sm font-bold
                text-brand-brown-800
              "
            >
              {getInitials(name)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-brand-brown-950">
                  {name || "Community name"}
                </h2>

                <ShieldCheck
                  size={15}
                  className="text-brand-desert-dark"
                />
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Proposed canonical community
              </p>
            </div>

          </div>

          <p className="mt-5 text-sm leading-6 text-brand-brown-600">
            {description || "No description provided."}
          </p>

          <div className="mt-5 border-t pt-5">

            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Scope
            </p>

            <p className="mt-2 text-xs leading-5 text-brand-brown-700">
              {scope || "No scope provided."}
            </p>

          </div>

          <div className="mt-5 border-t pt-5">

            <div className="flex items-center gap-2">
              <Hash
                size={14}
                className="text-brand-desert-dark"
              />

              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Initial contexts
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      rounded-full
                      bg-brand-sand
                      px-2.5 py-1
                      text-[11px] font-medium
                      text-brand-brown-700
                    "
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No hashtags selected.
                </span>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* What happens */}
      <section className="rounded-2xl border bg-brand-cream p-5">

        <div className="flex items-start gap-3">
          <Info
            size={17}
            className="mt-0.5 shrink-0 text-brand-desert-dark"
          />

          <div>
            <h2 className="text-sm font-bold text-brand-brown-950">
              What happens after you submit?
            </h2>

            <div className="mt-3 space-y-2.5">
              {[
                "The platform checks for duplicate or overlapping communities.",
                "The proposal is reviewed for clarity and community standards.",
                "If approved, the community becomes available to everyone.",
                "You become the community's first citizen — not its owner.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-2"
                >
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-brand-desert-dark"
                  />

                  <p className="text-xs leading-5 text-brand-brown-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "CO";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}