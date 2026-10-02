import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, View, useWindowDimensions } from 'react-native';
import { getTour, parseToursDone, withTourDone, type TourId } from '@/onboarding/tours';
import { useSettings } from '@/context/SettingsContext';

/** Where a target sits on screen, in window coordinates. */
export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Measure = () => Promise<TargetRect | null>;

interface TourState {
  tourId: TourId | null;
  stepIndex: number;
  /** Where the CURRENT step's target is, after scrolling it into view. Null while settling. */
  activeRect: TargetRect | null;
  registerTarget: (id: string, measure: Measure) => void;
  unregisterTarget: (id: string) => void;
  /** A target's layout changed: re-measure it if it is the one being pointed at. */
  targetMoved: (id: string) => void;
  /** The host screen lends its scroller, so a target below the fold can be brought into view. */
  setScroller: (fn: ((dy: number) => void) | null) => void;
  showTour: (id: TourId) => void;
  next: () => void;
  finish: () => void;
}

const noop = () => {};
const TourCtx = createContext<TourState>({
  tourId: null,
  stepIndex: 0,
  activeRect: null,
  registerTarget: noop,
  unregisterTarget: noop,
  targetMoved: noop,
  setScroller: noop,
  showTour: noop,
  next: noop,
  finish: noop,
});

export const useTour = () => useContext(TourCtx);

/** Room to leave above and below a highlighted thing when scrolling it into view. */
const MARGIN = 120;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs a tour: which step, where its target is, and how to get that target on screen.
 *
 * THE PART THAT MATTERS: a step whose target sits below the fold used to dim the screen and point
 * at nothing — the child was told "your schoolwork lives here" with no "here" anywhere in view. So
 * before each step the provider MEASURES the target, SCROLLS it into view when it is off screen or
 * too near an edge, and measures again. A step only draws once it knows where it is pointing.
 *
 * Targets register a measure FUNCTION rather than pushing their position, because a position goes
 * stale the moment the screen scrolls and nothing fires onLayout when it does.
 */
export function TourProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSetting } = useSettings();
  const [tourId, setTourId] = useState<TourId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeRect, setActiveRect] = useState<TargetRect | null>(null);
  // A rotation or split-screen change moves everything: the step re-measures its target.
  const { width: winW, height: winH } = useWindowDimensions();

  // Refs, not state: registering a target must never cause a re-render, or measuring loops.
  const targets = useRef(new Map<string, Measure>());
  const scroller = useRef<((dy: number) => void) | null>(null);
  /** The target the current step points at, once it has been brought into view. */
  const settledTarget = useRef<string | null>(null);

  const registerTarget = useCallback((id: string, measure: Measure) => {
    targets.current.set(id, measure);
  }, []);
  const unregisterTarget = useCallback((id: string) => {
    targets.current.delete(id);
  }, []);
  /**
   * The highlighted thing changed size or moved AFTER it was measured — a label that fits itself on
   * its second frame (START ADVENTURE is taller for one frame), a font arriving, content loading
   * above it. Measuring once at the start of a step left the spotlight on that stale box; so a
   * settled target is simply measured again whenever its layout changes.
   */
  const targetMoved = useCallback((id: string) => {
    if (settledTarget.current !== id) return;
    const measure = targets.current.get(id);
    if (!measure) return;
    void measure().then((rect) => {
      if (rect && settledTarget.current === id) {
        setActiveRect((prev) =>
          prev && prev.x === rect.x && prev.y === rect.y && prev.width === rect.width && prev.height === rect.height ? prev : rect,
        );
      }
    });
  }, []);

  const setScroller = useCallback((fn: ((dy: number) => void) | null) => {
    scroller.current = fn;
  }, []);

  const showTour = useCallback(
    (id: TourId) => {
      if (parseToursDone(settings.toursDone).has(id)) return;
      setStepIndex(0);
      setTourId(id);
    },
    [settings.toursDone],
  );

  const finish = useCallback(() => {
    const id = tourId;
    setTourId(null);
    setStepIndex(0);
    setActiveRect(null);
    settledTarget.current = null;
    if (!id) return;
    // Recorded on finish AND on skip, so a tour never reappears either way.
    void updateSetting('toursDone', withTourDone(settings.toursDone, id)).catch(() => {});
  }, [tourId, settings.toursDone, updateSetting]);

  const next = useCallback(() => {
    if (!tourId) return;
    const steps = getTour(tourId).steps;
    setActiveRect(null); // the next step re-measures before it draws
    settledTarget.current = null;
    setStepIndex((i) => Math.min(i + 1, steps.length));
  }, [tourId]);

  /**
   * Bring the current step's target on screen, then record where it ended up.
   *
   * Cancelled cleanly if the step moves on while it is settling, so a fast tapper never gets a
   * spotlight left over from the previous step.
   */
  useEffect(() => {
    if (!tourId) return;
    const steps = getTour(tourId).steps;
    if (stepIndex >= steps.length) return; // the closing celebration has no target
    const id = steps[stepIndex].target;
    let cancelled = false;

    void (async () => {
      const measure = targets.current.get(id);
      if (!measure) return;

      let rect = await measure();
      if (cancelled || !rect) return;

      const win = Dimensions.get('window').height;
      const tooHigh = rect.y < MARGIN;
      const tooLow = rect.y + rect.height > win - MARGIN;
      if ((tooHigh || tooLow) && scroller.current) {
        const wanted = Math.max(MARGIN, Math.min(win * 0.4, win - rect.height - MARGIN));
        scroller.current(rect.y - wanted);
        await wait(400); // let the scroll land before trusting a measurement again
        if (cancelled) return;
        rect = await measure();
        if (cancelled || !rect) return;
      }
      setActiveRect(rect);
      settledTarget.current = id;
      // A layout that finished between the measurement and now fired no event we listened to:
      // confirm once, a beat later.
      await wait(250);
      if (!cancelled) targetMoved(id);
    })();

    return () => {
      cancelled = true;
    };
  }, [tourId, stepIndex, winW, winH, targetMoved]);

  const value = useMemo<TourState>(
    () => ({ tourId, stepIndex, activeRect, registerTarget, unregisterTarget, targetMoved, setScroller, showTour, next, finish }),
    [tourId, stepIndex, activeRect, registerTarget, unregisterTarget, targetMoved, setScroller, showTour, next, finish],
  );

  return <TourCtx.Provider value={value}>{children}</TourCtx.Provider>;
}

/**
 * Marks something a tour can point at.
 *
 * Wraps its children in a plain View that can measure itself on demand. The View adds no styling
 * and no layout of its own — a tour must never move the thing it is describing.
 */
export function TourTarget({ id, children }: { id: string; children: React.ReactNode }) {
  const { registerTarget, unregisterTarget, targetMoved } = useTour();
  const ref = useRef<View>(null);

  useEffect(() => {
    registerTarget(
      id,
      () =>
        new Promise<TargetRect | null>((resolve) => {
          const node = ref.current;
          if (!node) return resolve(null);
          // measureInWindow, not onLayout: onLayout gives a position within the parent and never
          // fires on scroll, and the overlay needs window coordinates as they are right now.
          node.measureInWindow((x, y, width, height) => {
            resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
          });
        }),
    );
    return () => unregisterTarget(id);
  }, [id, registerTarget, unregisterTarget]);

  return (
    // onLayout fires when this target's size or its position in its parent changes; the provider
    // re-measures it in window coordinates if it is the one currently highlighted.
    <View ref={ref} collapsable={false} onLayout={() => targetMoved(id)}>
      {children}
    </View>
  );
}
