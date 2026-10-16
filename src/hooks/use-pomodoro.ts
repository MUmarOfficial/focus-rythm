import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerPhase, SessionSettings } from '../types';
import { SessionSegment, computeSegmentPlan } from '../lib/stats';
import {
  WORK_QUOTES,
  REST_PROMPTS,
  REST_BENEFITS,
  workQuoteSelector,
  restPromptSelector,
  restBenefitSelector,
  QuoteItem
} from '../lib/quotes';
import { desktop } from '../lib/desktop';

export interface UsePomodoroOptions {
  onSessionFinish?: (focusedSeconds: number, rounds: number) => void;
}

export function usePomodoro({ onSessionFinish }: UsePomodoroOptions = {}) {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Segment plan and current segment pointer
  const [segments, setSegments] = useState<SessionSegment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);

  // Timing state: absolute endsAt timestamp and remainingMs when paused
  const [endsAt, setEndsAt] = useState<number>(0);
  const [pausedRemainingMs, setPausedRemainingMs] = useState<number>(0);

  // Accrued metrics for the active session
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [accruedWorkSeconds, setAccruedWorkSeconds] = useState<number>(0);

  // Segment-level tracking so live incremental saves never double-count
  const segmentStartedAtRef = useRef<number>(0);
  const workDurationAccruedInCurrentSegmentRef = useRef<number>(0);
  const roundCreditedInCurrentSegmentRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundCuesEnabledRef = useRef(true);

  const onSessionFinishRef = useRef(onSessionFinish);
  onSessionFinishRef.current = onSessionFinish;

  // A short, distinct notification tone for every work/rest start.
  const playTransitionBeep = useCallback((nextType: 'work' | 'break') => {
    if (!soundCuesEnabledRef.current) return;
    try {
      const legacyAudio = (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const AudioContextClass = window.AudioContext || legacyAudio;
      if (!AudioContextClass) return;
      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;
      if (context.state === 'suspended') void context.resume();

      const now = context.currentTime;
      const frequencies = nextType === 'work' ? [660, 880] : [440, 330];
      frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startAt = now + index * 0.15;
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.1, startAt + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.12);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + 0.13);
      });
    } catch (error) {
      console.warn('Could not play transition beep:', error);
    }
  }, []);

  // Quotes and rest messages selected at phase transitions or cycled on demand
  const [currentWorkQuote, setCurrentWorkQuote] = useState<QuoteItem>(() =>
    workQuoteSelector.select(WORK_QUOTES)
  );
  const [currentRestPrompt, setCurrentRestPrompt] = useState<QuoteItem>(() =>
    restPromptSelector.select(REST_PROMPTS)
  );
  const [currentRestBenefit, setCurrentRestBenefit] = useState<QuoteItem>(() =>
    restBenefitSelector.select(REST_BENEFITS)
  );

  // Manually cycle / request another suggestion
  const cycleWorkQuote = useCallback(() => {
    setCurrentWorkQuote(workQuoteSelector.select(WORK_QUOTES));
  }, []);

  const cycleRestPrompt = useCallback(() => {
    setCurrentRestPrompt(restPromptSelector.select(REST_PROMPTS));
  }, []);

  const cycleRestBenefit = useCallback(() => {
    setCurrentRestBenefit(restBenefitSelector.select(REST_BENEFITS));
  }, []);

  // For UI ticker re-render
  const [, setTick] = useState<number>(0);

  // Active segment
  const currentSegment = segments[currentSegmentIndex] as SessionSegment | undefined;

  // Flush any newly elapsed work seconds (and optionally credit the round) to stats
  const flushWorkProgress = useCallback(
    (
      segment: SessionSegment | undefined,
      remainingMs: number,
      creditRoundIfWorked: boolean
    ): { deltaSec: number; roundDelta: number } => {
      if (!segment || segment.type !== 'work') {
        return { deltaSec: 0, roundDelta: 0 };
      }

      const segmentTotalSec = Math.max(1, Math.round(segment.durationMs / 1000));
      const elapsedMs = Math.max(0, segment.durationMs - Math.max(0, remainingMs));
      let elapsedSec = Math.min(segmentTotalSec, Math.floor(elapsedMs / 1000));

      if (creditRoundIfWorked && elapsedMs >= 250 && elapsedSec === 0) {
        elapsedSec = 1;
      }

      const deltaSec = Math.max(0, elapsedSec - workDurationAccruedInCurrentSegmentRef.current);
      workDurationAccruedInCurrentSegmentRef.current += deltaSec;

      const hasWorkedInSegment = workDurationAccruedInCurrentSegmentRef.current > 0;
      const roundDelta =
        creditRoundIfWorked && hasWorkedInSegment && !roundCreditedInCurrentSegmentRef.current
          ? 1
          : 0;

      if (roundDelta > 0) {
        roundCreditedInCurrentSegmentRef.current = true;
      }

      if (deltaSec > 0) {
        setAccruedWorkSeconds((prev) => prev + deltaSec);
      }
      if (roundDelta > 0) {
        setCompletedRounds((prev) => prev + roundDelta);
      }

      if ((deltaSec > 0 || roundDelta > 0) && onSessionFinishRef.current) {
        onSessionFinishRef.current(deltaSec, roundDelta);
      }

      return { deltaSec, roundDelta };
    },
    []
  );

  // Start a new session
  const startSession = useCallback(
    (settings: SessionSettings) => {
      const plan = computeSegmentPlan(
        settings.totalMinutes,
        settings.workMinutes,
        settings.breakMinutes
      );

      if (plan.length === 0) return;
      soundCuesEnabledRef.current = settings.soundCues;

      setSegments(plan);
      setCurrentSegmentIndex(0);
      setCompletedRounds(0);
      setAccruedWorkSeconds(0);
      workDurationAccruedInCurrentSegmentRef.current = 0;
      roundCreditedInCurrentSegmentRef.current = false;
      segmentStartedAtRef.current = Date.now();

      const firstSegment = plan[0];
      const targetEnd = Date.now() + firstSegment.durationMs;
      setEndsAt(targetEnd);
      setPausedRemainingMs(firstSegment.durationMs);
      setIsPaused(false);

      setCurrentWorkQuote(workQuoteSelector.select(WORK_QUOTES));
      setPhase('work');
      playTransitionBeep('work');
    },
    [playTransitionBeep]
  );

  // Pause / Resume (applicable during work)
  const togglePause = useCallback(() => {
    if (phase !== 'work') return;

    if (!isPaused) {
      const remaining = Math.max(0, endsAt - Date.now());
      flushWorkProgress(currentSegment, remaining, false);
      setPausedRemainingMs(remaining);
      setIsPaused(true);
    } else {
      const newEndsAt = Date.now() + pausedRemainingMs;
      setEndsAt(newEndsAt);
      setIsPaused(false);
    }
  }, [phase, isPaused, endsAt, pausedRemainingMs, currentSegment, flushWorkProgress]);

  // Transition to next segment
  const advanceToSegment = useCallback(
    (nextIndex: number, currentSegments: SessionSegment[]) => {
      if (nextIndex >= currentSegments.length) {
        desktop.setFullscreen(false);
        desktop.showNotification(
          'Focus Session Complete',
          'You did great today. Consistency grows through small, honest sessions.'
        );
        setPhase('complete');
        return;
      }

      const nextSegment = currentSegments[nextIndex];
      setCurrentSegmentIndex(nextIndex);
      segmentStartedAtRef.current = Date.now();
      workDurationAccruedInCurrentSegmentRef.current = 0;
      roundCreditedInCurrentSegmentRef.current = false;

      const newEndsAt = Date.now() + nextSegment.durationMs;
      setEndsAt(newEndsAt);
      setPausedRemainingMs(nextSegment.durationMs);
      setIsPaused(false);

      if (nextSegment.type === 'work') {
        desktop.setFullscreen(false);
        setCurrentWorkQuote(workQuoteSelector.select(WORK_QUOTES));
        setPhase('work');
        playTransitionBeep('work');
      } else {
        desktop.setFullscreen(true);
        desktop.showNotification(
          'Time for a break.',
          'Step away from the screen, stretch, and rest your eyes.'
        );
        setCurrentRestPrompt(restPromptSelector.select(REST_PROMPTS));
        setCurrentRestBenefit(restBenefitSelector.select(REST_BENEFITS));
        setPhase('break');
        playTransitionBeep('break');
      }
    },
    [playTransitionBeep]
  );

  // Add 5 minutes to current break
  const addFiveMinutes = useCallback(() => {
    if (phase !== 'break') return;

    setEndsAt((prev) => prev + 5 * 60 * 1000);
    setSegments((prevSegments) => {
      const copy = [...prevSegments];
      if (copy[currentSegmentIndex]) {
        copy[currentSegmentIndex] = {
          ...copy[currentSegmentIndex],
          durationMs: copy[currentSegmentIndex].durationMs + 5 * 60 * 1000
        };
      }
      return copy;
    });
  }, [phase, currentSegmentIndex]);

  // Skip / End break early to start work immediately
  const skipBreakToWork = useCallback(() => {
    if (phase !== 'break') return;
    advanceToSegment(currentSegmentIndex + 1, segments);
  }, [phase, currentSegmentIndex, segments, advanceToSegment]);

  // Minimize to dock during break
  const minimizeToDock = useCallback(() => {
    desktop.minimizeWindow();
  }, []);

  // End session early or naturally
  const endSession = useCallback(
    (saveProgress = true) => {
      desktop.setFullscreen(false);

      let totalWorkedSec = accruedWorkSeconds;
      let totalRounds = completedRounds;

      if (saveProgress && phase === 'work' && currentSegment?.type === 'work') {
        const remainingMs = isPaused ? pausedRemainingMs : Math.max(0, endsAt - Date.now());
        const { deltaSec, roundDelta } = flushWorkProgress(currentSegment, remainingMs, true);
        totalWorkedSec += deltaSec;
        totalRounds += roundDelta;
      }

      if (saveProgress && (totalWorkedSec > 0 || totalRounds > 0)) {
        setPhase('complete');
      } else {
        setPhase('idle');
      }
    },
    [
      phase,
      currentSegment,
      isPaused,
      pausedRemainingMs,
      endsAt,
      accruedWorkSeconds,
      completedRounds,
      flushWorkProgress
    ]
  );

  // Reset back to setup screen
  const resetToSetup = useCallback(() => {
    desktop.setFullscreen(false);
    setPhase('idle');
    setIsPaused(false);
    setSegments([]);
    setCurrentSegmentIndex(0);
    setEndsAt(0);
    setPausedRemainingMs(0);
    setCompletedRounds(0);
    setAccruedWorkSeconds(0);
    workDurationAccruedInCurrentSegmentRef.current = 0;
    roundCreditedInCurrentSegmentRef.current = false;
  }, []);

  // State machine tick and segment transition handler
  useEffect(() => {
    if (phase === 'idle' || phase === 'complete') {
      return;
    }

    const interval = setInterval(() => {
      if (isPaused) return;

      const now = Date.now();
      const remainingMs = endsAt - now;

      setTick(now);

      if (phase === 'work' && currentSegment?.type === 'work') {
        if (remainingMs > 0) {
          flushWorkProgress(currentSegment, remainingMs, false);
        } else {
          flushWorkProgress(currentSegment, 0, true);
          advanceToSegment(currentSegmentIndex + 1, segments);
        }
      } else if (phase === 'break' && remainingMs <= 0) {
        advanceToSegment(currentSegmentIndex + 1, segments);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [
    phase,
    isPaused,
    endsAt,
    currentSegment,
    currentSegmentIndex,
    segments,
    flushWorkProgress,
    advanceToSegment
  ]);

  // Derived remaining times
  const currentSegmentRemainingMs = isPaused
    ? pausedRemainingMs
    : Math.max(0, endsAt - Date.now());

  // Calculate total remaining session time
  let totalRemainingSessionMs = currentSegmentRemainingMs;
  for (let i = currentSegmentIndex + 1; i < segments.length; i++) {
    totalRemainingSessionMs += segments[i].durationMs;
  }

  return {
    phase,
    isPaused,
    currentSegment,
    currentSegmentIndex,
    totalSegments: segments.length,
    endsAt,
    currentSegmentRemainingMs,
    totalRemainingSessionMs,
    completedRounds,
    accruedWorkSeconds,
    currentWorkQuote,
    currentRestPrompt,
    currentRestBenefit,
    cycleWorkQuote,
    cycleRestPrompt,
    cycleRestBenefit,
    startSession,
    togglePause,
    addFiveMinutes,
    skipBreakToWork,
    minimizeToDock,
    endSession,
    resetToSetup
  };
}
