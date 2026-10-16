import React from 'react';
import { FxLevel } from '../../types';

export interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
  fxLevel?: FxLevel;
  animate?: boolean;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  className = '',
  as: Component = 'span',
  fxLevel = 'LOW',
  animate = false
}) => {
  if (fxLevel === 'OFF') {
    return <Component className={className}>{text}</Component>;
  }

  const animClass = animate && fxLevel === 'FULL' ? 'rare-glitch-anim' : '';

  return (
    <Component
      className={`cyber-glitch-text ${animClass} ${className}`}
      data-text={text}
    >
      {text}
    </Component>
  );
};
