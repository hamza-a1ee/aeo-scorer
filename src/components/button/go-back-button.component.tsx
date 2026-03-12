import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export default function GoBackButton({
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "w-full bg-neutral-gray-0 h-12 rounded-lg cursor-pointer font-medium text-test-secondary hover:bg-neutral-gray-10 transition-colors",
        className,
      )}
      {...props}
    >
      Go Back
    </button>
  );
}
