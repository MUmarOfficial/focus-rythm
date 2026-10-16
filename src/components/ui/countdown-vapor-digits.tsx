import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FxLevel } from '../../types';

export interface CountdownVaporDigitsProps {
  /** Target timestamp in ms or Date object */
  targetTime: Date | number;
  label?: string;
  ariaLabel?: string;
  className?: string;
  onComplete?: () => void;
  accentColor?: string; // hex or rgb, e.g. '#00ff88' or '#00d4ff'
  isPaused?: boolean;
  remainingMs?: number; // explicit remaining ms when paused
  fxLevel?: FxLevel;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
}

export const CountdownVaporDigits: React.FC<CountdownVaporDigitsProps> = ({
  targetTime,
  label,
  ariaLabel,
  className = '',
  onComplete,
  accentColor = '#00ff88',
  isPaused = false,
  remainingMs: pausedRemainingMs,
  fxLevel = 'LOW'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const targetTimestamp = useMemo(() => {
    return typeof targetTime === 'number' ? targetTime : targetTime.getTime();
  }, [targetTime]);

  // Remaining time derived from target timestamp & Date.now()
  const calculateRemaining = (): number => {
    if (isPaused && pausedRemainingMs !== undefined) {
      return Math.max(0, pausedRemainingMs);
    }
    return Math.max(0, targetTimestamp - Date.now());
  };

  const [displaySeconds, setDisplaySeconds] = useState<number>(() => {
    return Math.ceil(calculateRemaining() / 1000);
  });

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const completedTriggeredRef = useRef(false);

  // Deriving timer display every second without modifying state in rAF
  useEffect(() => {
    completedTriggeredRef.current = false;

    const updateDisplay = () => {
      const remaining = calculateRemaining();
      const totalSec = Math.ceil(remaining / 1000);
      setDisplaySeconds(totalSec);

      if (totalSec <= 0 && !completedTriggeredRef.current) {
        completedTriggeredRef.current = true;
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    updateDisplay();

    if (isPaused) {
      return;
    }

    const interval = setInterval(updateDisplay, 250);
    return () => clearInterval(interval);
  }, [targetTimestamp, isPaused, pausedRemainingMs]);

  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedTime = `${formattedMinutes}:${formattedSeconds}`;
  const isoDuration = `PT${minutes}M${seconds}S`;

  // Vapor canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // If FX is OFF or reduced motion, do not run particle vapor canvas
    if (fxLevel === 'OFF' || prefersReducedMotion) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => {
        mediaQuery.removeEventListener('change', handleMotionChange);
      };
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isHidden = document.hidden;

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Particle pool
    const particles: Particle[] = [];
    const maxParticles = fxLevel === 'FULL' ? 36 : 18;

    // Canvas sizing with devicePixelRatio
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(10, rect.width * dpr);
      canvas.height = Math.max(10, rect.height * dpr);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    // Particle spawning
    const spawnParticle = (width: number, height: number): Particle => {
      // Spawn near bottom or middle where digits are
      const x = width * 0.15 + Math.random() * (width * 0.7);
      const y = height * 0.4 + Math.random() * (height * 0.5);
      const maxLife = 40 + Math.random() * 50;
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.5 + Math.random() * 0.8), // drift upwards
        size: 2.5 + Math.random() * 4.5,
        alpha: 0,
        maxAlpha: 0.15 + Math.random() * 0.25,
        life: 0,
        maxLife
      };
    };

    // Color conversion for alpha gradient
    let rgb = '0, 255, 136';
    if (accentColor.includes('00d4ff')) {
      rgb = '0, 212, 255';
    } else if (accentColor.includes('ff00ff')) {
      rgb = '255, 0, 255';
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (isHidden || isPaused) {
        lastTime = now;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Spawn new particles if below limit
      if (particles.length < maxParticles && Math.random() < 0.4) {
        particles.push(spawnParticle(width, height));
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt * 60;
        p.x += p.vx;
        p.y += p.vy;

        // Fade in then out
        const progress = p.life / p.maxLife;
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.maxAlpha;
        } else {
          p.alpha = (1 - (progress - 0.2) / 0.8) * p.maxAlpha;
        }

        if (p.life >= p.maxLife || p.y < 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw soft vapor particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `rgba(${rgb}, ${p.alpha})`);
        gradient.addColorStop(1, `rgba(${rgb}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQuery.removeEventListener('change', handleMotionChange);
      resizeObserver.disconnect();
    };
  }, [accentColor, isPaused, fxLevel]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center justify-center p-4 select-none ${className}`}
      aria-label={ariaLabel || `${label || 'Remaining timer'}: ${minutes} minutes and ${seconds} seconds`}
    >
      {label && (
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 z-10">
          {label}
        </span>
      )}

      {/* Accessible real <time> element strictly visible and readable */}
      <div className="relative z-10 flex items-center justify-center">
        <time
          dateTime={isoDuration}
          className="font-heading font-black tabular-digits text-center tracking-wider text-foreground leading-none transition-colors duration-200"
          style={{
            fontSize: 'clamp(3.5rem, 11vw, 7.5rem)',
            color: accentColor,
            textShadow: `0 0 20px ${accentColor}50, 0 0 40px ${accentColor}25`
          }}
        >
          {formattedTime}
        </time>
      </div>

      {/* Canvas particle vapor effect layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20 w-full h-full"
        aria-hidden="true"
      />
    </div>
  );
};
