"use client";

const steps = [
  {
    number: 1,
    label: "Identity",
  },
  {
    number: 2,
    label: "Purpose",
  },
  {
    number: 3,
    label: "Contexts",
  },
  {
    number: 4,
    label: "Review",
  },
];

interface ProposalProgressProps {
  currentStep: number;
}

export function ProposalProgress({
  currentStep,
}: ProposalProgressProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const completed = step.number < currentStep;
        const active = step.number === currentStep;

        return (
          <div
            key={step.number}
            className="flex min-w-0 flex-1 items-center"
          >
            <div className="flex items-center gap-2">

              <div
                className={`
                  flex h-8 w-8 shrink-0 items-center justify-center
                  rounded-full text-xs font-bold
                  transition-colors
                  ${completed
                    ? "bg-brand-brown-950 text-white"
                    : active
                      ? "bg-brand-desert text-brand-brown-950"
                      : "bg-brand-sand text-brand-brown-600"
                  }
                `}
              >
                {completed ? "✓" : step.number}
              </div>

              <span
                className={`
                  hidden text-xs font-semibold sm:block
                  ${active || completed
                    ? "text-brand-brown-950"
                    : "text-muted-foreground"
                  }
                `}
              >
                {step.label}
              </span>

            </div>

            {index < steps.length - 1 && (
              <div
                className={`
                  mx-3 h-px flex-1
                  ${completed
                    ? "bg-brand-brown-950"
                    : "bg-brand-sand-dark"
                  }
                `}
              />
            )}

          </div>
        );
      })}
    </div>
  );
}