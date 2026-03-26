"use client";

const steps = ["Draft", "Sent", "Viewed", "Accepted"] as const;

interface ProposalStatusStepperProps {
  status: string;
}

export function ProposalStatusStepper({ status }: ProposalStatusStepperProps) {
  const currentIndex = steps.indexOf(status as (typeof steps)[number]);
  // For statuses not in the stepper (Declined, Expired, Revised), don't render
  if (currentIndex === -1) return null;

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isFilled = i <= currentIndex;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  isFilled
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                {isFilled ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  isFilled ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-12 rounded-full ${
                  i < currentIndex ? "bg-blue-600" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
