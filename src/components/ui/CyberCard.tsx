import React from 'react';

export type CyberCardVariant = 'default' | 'terminal' | 'holographic';

export interface CyberCardProps {
  variant?: CyberCardVariant;
  title?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  glow?: boolean;
  cornerAccent?: 'accent' | 'cyan' | 'magenta';
}

export const CyberCard: React.FC<CyberCardProps> = ({
  variant = 'default',
  title = 'terminal.sh',
  className = '',
  bodyClassName = '',
  children,
  glow = false,
  cornerAccent = 'accent'
}) => {
  if (variant === 'terminal') {
    return (
      <div
        className={`relative border border-border bg-background cyber-chamfer overflow-hidden shadow-lg flex flex-col ${
          glow ? 'glow-accent' : ''
        } ${className}`}
      >
        {/* Terminal Header */}
        <div className="shrink-0 flex items-center justify-between px-3.5 py-1.5 border-b border-border bg-[#12121a]/90 select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/80 border border-destructive" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 border border-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]/80 border border-[#00ff88]" />
            <span className="ml-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {title}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 opacity-50">
            <span className="w-3 h-0.5 bg-muted-foreground" />
            <span className="w-2.5 h-2.5 border border-muted-foreground" />
          </div>
        </div>
        <div className={`p-3.5 sm:p-4 text-foreground font-mono flex-1 min-h-0 flex flex-col ${bodyClassName}`}>
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'holographic') {
    const accentBorder =
      cornerAccent === 'cyan'
        ? 'border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
        : cornerAccent === 'magenta'
        ? 'border-[#ff00ff]/40 shadow-[0_0_15px_rgba(255,0,255,0.15)]'
        : 'border-[#00ff88]/40 shadow-[0_0_15px_rgba(0,255,136,0.15)]';

    const bracketColor =
      cornerAccent === 'cyan'
        ? 'text-[#00d4ff]'
        : cornerAccent === 'magenta'
        ? 'text-[#ff00ff]'
        : 'text-[#00ff88]';

    return (
      <div
        className={`relative border bg-muted/30 backdrop-blur-md cyber-chamfer p-3.5 sm:p-4 transition-all duration-200 ${accentBorder} ${className}`}
      >
        {/* Corner Brackets */}
        <span className={`absolute top-1 left-1 text-[10px] select-none font-mono opacity-80 ${bracketColor}`}>
          ┌
        </span>
        <span className={`absolute top-1 right-1 text-[10px] select-none font-mono opacity-80 ${bracketColor}`}>
          ┐
        </span>
        <span className={`absolute bottom-1 left-1 text-[10px] select-none font-mono opacity-80 ${bracketColor}`}>
          └
        </span>
        <span className={`absolute bottom-1 right-1 text-[10px] select-none font-mono opacity-80 ${bracketColor}`}>
          ┘
        </span>

        {children}
      </div>
    );
  }

  // default variant
  return (
    <div
      className={`relative border border-border bg-background cyber-chamfer p-3.5 sm:p-4 transition-all duration-200 hover:border-border/90 ${
        glow ? 'shadow-[0_0_15px_rgba(0,255,136,0.2)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
