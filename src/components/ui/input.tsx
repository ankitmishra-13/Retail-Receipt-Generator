// Input Component (src/components/ui/input.tsx)
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, value, ...props }, ref) => {
  return (
    <input
      type={type ?? "text"}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      suppressHydrationWarning
      value={
        value === undefined || value === null || Number.isNaN(value)
          ? ""
          : value
      }
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
