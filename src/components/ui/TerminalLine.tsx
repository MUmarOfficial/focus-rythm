import React, { useState, useEffect } from 'react';
import { FxLevel } from '../../types';

export interface TerminalLineProps {
  prompt?: string;
  text: string;
  typing?: boolean;
  typingSpeed?: number;
  showCursor?: boolean;
  cursorColor?: 'accent' | 'cyan' | 'magenta';
  className?: string;
  textClassName?: string;
  fxLevel?: FxLevel;
}

export const TerminalLine: React.FC<TerminalLineProps> = ({
  prompt = '>',
  text,
  typing = false,
  typingSpeed = 25,
  showCursor = true,
  cursorColor = 'accent',
  className = '',
  textClassName = 'text-[#e0e0e0]',
  fxLevel = 'LOW'
}) => {
  const [displayedLength, setDisplayedLength] = useState<number>(() => (typing ? 0 : text.length));

  useEffect(() => {
    // If typing is disabled or reduced motion / FX OFF, show entire text immediately
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!typing || prefersReducedMotion || fxLevel === 'OFF') {
      setDisplayedLength(text.length);
      return;
    }

    setDisplayedLength(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setDisplayedLength(current);
      if (current >= text.length) {
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, typing, typingSpeed, fxLevel]);

  const cursorColorClass =
    cursorColor === 'cyan'
      ? 'bg-[#00d4ff]'
      : cursorColor === 'magenta'
      ? 'bg-[#ff00ff]'
      : 'bg-[#00ff88]';

  const promptColorClass =
    cursorColor === 'cyan'
      ? 'text-[#00d4ff]'
      : cursorColor === 'magenta'
      ? 'text-[#ff00ff]'
      : 'text-[#00ff88]';

  return (
    <div className={`font-mono text-sm flex items-start space-x-2 select-text ${className}`}>
      {prompt && (
        <span className={`select-none font-bold ${promptColorClass}`} aria-hidden="true">
          {prompt}
        </span>
      )}
      <span className={`leading-relaxed ${textClassName}`}>
        {text.slice(0, displayedLength)}
        {showCursor && (
          <span
            className={`inline-block w-2 h-4 ml-1 align-middle animate-blink ${cursorColorClass}`}
            aria-hidden="true"
          />
        )}
      </span>
    </div>
  );
};
