import React from 'react';

export interface NeonBadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'cyan' | 'magenta' | 'muted';
  className?: string;
  size?: 'sm' | 'md';
}

export const NeonBadge: React.FC<NeonBadgeProps> = ({
  children,
  variant = 'accent',
  className = '',
  size = 'md'
}) => {
  let colorClasses = '';
  switch (variant) {
    case 'accent':
      colorClasses = 'border-[#00ff88]/60 text-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_8px_rgba(0,255,136,0.2)]';
      break;
    case 'cyan':
      colorClasses = 'border-[#00d4ff]/60 text-[#00d4ff] bg-[#00d4ff]/5 shadow-[0_0_8px_rgba(0,212,255,0.2)]';
      break;
    case 'magenta':
      colorClasses = 'border-[#ff00ff]/60 text-[#ff00ff] bg-[#ff00ff]/5 shadow-[0_0_8px_rgba(255,0,255,0.2)]';
      break;
    case 'muted':
      colorClasses = 'border-[#2a2a3a] text-[#6b7280] bg-[#1c1c2e]/40';
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] tracking-[0.15em]'
      : 'px-3 py-1 text-xs tracking-[0.2em]';

  return (
    <span
      className={`inline-flex items-center justify-center font-mono uppercase font-semibold border cyber-chamfer-sm select-none ${colorClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
