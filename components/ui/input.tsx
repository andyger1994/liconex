import { cn } from "@/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, className, ...props }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm text-white/72">
      <span>{label}</span>
      <input
        className={cn(
          "min-h-12 rounded-2xl border border-white/12 bg-white/10 px-4 text-base text-white outline-none placeholder:text-white/35 focus:border-mint",
          className
        )}
        {...props}
      />
    </label>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-sm text-white/72">
      <span>{label}</span>
      <select
        className={cn(
          "min-h-12 rounded-2xl border border-white/12 bg-moss px-4 text-base text-white outline-none focus:border-mint",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

type AreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextArea({ label, className, ...props }: AreaProps) {
  return (
    <label className="grid gap-2 text-sm text-white/72">
      <span>{label}</span>
      <textarea
        className={cn(
          "min-h-28 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-base text-white outline-none placeholder:text-white/35 focus:border-mint",
          className
        )}
        {...props}
      />
    </label>
  );
}
