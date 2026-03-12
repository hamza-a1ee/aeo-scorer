import { cn } from "@/lib/utils";

interface Props {
  currentStep: number;
  totalSteps?: number;
}

export default function Stepper({ currentStep, totalSteps = 5 }: Props) {
  return (
    <div className="flex items-center  w-full overflow-x-auto">
      <div className="relative flex items-center shrink-0 z-10">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isSelected = stepNumber <= currentStep;

          return (
            <div key={stepNumber} className="flex items-center shrink-0">
              <div
                className={cn(
                  "rounded-full flex items-center justify-center font-medium transition-colors",
                  "w-7 h-7 text-xs md:w-9 md:h-9 md:text-sm lg:w-10 lg:h-10 lg:text-base",
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-light-orange text-black"
                )}
              >
                {stepNumber}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "h-0.5 transition-colors shrink-0",
                    "w-4  lg:w-5",
                    stepNumber < currentStep ? "bg-primary" : "bg-light-orange"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
