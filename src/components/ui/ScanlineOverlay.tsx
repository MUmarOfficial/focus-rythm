import React from 'react';
import { FxLevel } from '../../types';

export interface ScanlineOverlayProps {
  fxLevel: FxLevel;
  className?: string;
}

export const ScanlineOverlay: React.FC<ScanlineOverlayProps> = ({ fxLevel, className = '' }) => {
  if (fxLevel === 'OFF') {
    return null;
  }

  const scanlineClass = fxLevel === 'FULL' ? 'scanlines' : 'scanlines-low';

  return <div className={`pointer-events-none fixed inset-0 z-50 ${scanlineClass} ${className}`} aria-hidden="true" />;
};
