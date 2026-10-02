import { useCallback, useState } from 'react';

/**
 * Tracing Lock Mode. Touching the canvas LOCKS the page (no scrolling) and it stays locked until the
 * child or grown-up taps the lock control, so a stroke that wanders to an edge cannot move the screen.
 * State lives in the host screen, so leaving it always unlocks. `drawing` covers the finger being down.
 */
export function useTracingLock() {
  const [locked, setLocked] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const onDrawingChange = useCallback((d: boolean) => {
    setDrawing(d);
    if (d) setLocked(true);
  }, []);
  const toggle = useCallback(() => setLocked((l) => !l), []);
  return { locked, scrollEnabled: !locked && !drawing, onDrawingChange, toggle };
}
