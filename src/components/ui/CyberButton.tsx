import React from 'react';

export type CyberButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'glitch';

export interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CyberButtonVariant;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  variant = 'default',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-mono uppercase tracking-widest text-sm font-semibold transition-all duration-150 select-none min-h-[44px] px-6 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  let variantClasses = '';

  switch (variant) {
    case 'default':
      // transparent, 2px accent border, accent text, chamfer-sm, hover fills accent + dark text + neon glow
      variantClasses =
        'cyber-chamfer-sm border-2 border-[#00ff88] text-[#00ff88] bg-transparent hover:bg-[#00ff88] hover:text-[#0a0a0f] hover:shadow-[0_0_15px_rgba(0,255,136,0.6)]';
      break;
    case 'secondary':
      // magenta variant
      variantClasses =
        'cyber-chamfer-sm border-2 border-[#ff00ff] text-[#ff00ff] bg-transparent hover:bg-[#ff00ff] hover:text-[#0a0a0f] hover:shadow-[0_0_15px_rgba(255,0,255,0.6)] focus-visible:ring-[#ff00ff]';
      break;
    case 'outline':
      // 1px border, hover -> accent
      variantClasses =
        'cyber-chamfer-sm border border-[#2a2a3a] text-[#e0e0e0] bg-[#12121a]/60 hover:border-[#00ff88] hover:text-[#00ff88] hover:shadow-[0_0_10px_rgba(0,255,136,0.3)]';
      break;
    case 'ghost':
      // hover accent/10
      variantClasses =
        'border border-transparent text-[#6b7280] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 hover:border-[#00d4ff]/30';
      break;
    case 'glitch':
      // solid accent fill, dark text, chromatic aberration, hover brightness(1.1)
      variantClasses =
        'cyber-chamfer-sm bg-[#00ff88] text-[#0a0a0f] font-bold border-2 border-[#00ff88] hover:brightness-110 shadow-[0_0_15px_rgba(0,255,136,0.5)]';
      break;
  }

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {variant === 'glitch' ? (
        <span className="cyber-glitch-text" data-text={typeof children === 'string' ? children : undefined}>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
