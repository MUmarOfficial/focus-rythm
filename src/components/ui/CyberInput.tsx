import React, { useId } from 'react';

export interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  unit?: string;
}

export const CyberInput: React.FC<CyberInputProps> = ({
  label,
  error,
  hint,
  unit,
  className = '',
  disabled,
  id: explicitId,
  ...props
}) => {
  const generatedId = useId();
  const inputId = explicitId || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground"
        >
          <span>{label}</span>
          {unit && <span className="text-[#00ff88]/70 lowercase">{unit}</span>}
        </label>
      )}

      <div
        className={`relative flex items-center bg-[#12121a] border ${
          error
            ? 'border-destructive shadow-[0_0_8px_rgba(255,51,102,0.3)]'
            : 'border-border focus-within:border-[#00ff88] focus-within:shadow-[0_0_10px_rgba(0,255,136,0.3)]'
        } cyber-chamfer-sm transition-all duration-150`}
      >
        <span
          className="pl-3 pr-1 text-sm font-mono text-[#00ff88] select-none pointer-events-none"
          aria-hidden="true"
        >
          &gt;
        </span>
        <input
          id={inputId}
          className={`w-full bg-transparent py-2.5 pr-3 text-sm font-mono text-[#00ff88] placeholder-muted-foreground/60 focus:outline-none disabled:opacity-40 tabular-digits ${className}`}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        />
      </div>

      {error ? (
        <p id={errorId} role="alert" className="font-mono text-xs text-destructive flex items-center space-x-1">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="font-mono text-[11px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
