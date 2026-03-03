// src/components/ui/input.tsx — Carbon themed
import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-8 w-full rounded border bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)] font-[var(--font-body)]",
      "border-[var(--border)] placeholder:text-[var(--text-tertiary)]",
      "focus-visible:outline-none focus-visible:border-[var(--amber)] focus-visible:ring-0",
      "disabled:cursor-not-allowed disabled:opacity-40 transition-colors",
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"
export { Input }
