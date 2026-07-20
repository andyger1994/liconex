import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50",
        variant === "primary" && "bg-mint text-ink shadow-lg shadow-mint/20",
        variant === "secondary" && "glass text-white",
        variant === "danger" && "bg-danger text-white",
        variant === "ghost" && "text-white/80",
        className
      )}
      {...props}
    />
  );
}
