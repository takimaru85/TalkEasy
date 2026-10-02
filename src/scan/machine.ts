import type { ScanFailure, ScanState } from './types';

/**
 * The scan flow as a state machine. Pure — every transition is a function of the state and an
 * event, so the checks can walk the whole flow without a camera.
 *
 * WHY A MACHINE. The brief for this feature listed eleven states, and the version of it built from
 * independent booleans is the version where a parent sees a spinner on top of an error message, or
 * taps "Use photo" twice and starts two recognitions. Here there is exactly one state at a time and
 * an event that does not apply is IGNORED rather than half-applied — which is also what makes the
 * back button safe at any point.
 */
export type ScanEvent =
  | { type: 'photoTaken'; imageUri: string }
  | { type: 'retake' }
  | { type: 'usePhoto' }
  | { type: 'ocrDone'; text: string; confident: boolean }
  | { type: 'ocrFailed'; reason: ScanFailure }
  /** The grown-up chose to type it in instead — always available, from any failure. */
  | { type: 'enterManually' }
  | { type: 'editText'; text: string }
  | { type: 'review' }
  | { type: 'saved'; assignmentId: number }
  | { type: 'reset' };

export const initialScanState: ScanState = { kind: 'idle' };

/** Text recognised with low confidence is still worth showing — but it is never called a success. */
export function scanReducer(state: ScanState, event: ScanEvent): ScanState {
  switch (event.type) {
    case 'photoTaken':
      // Accepted from anywhere: a parent may retake after a failure, or scan a second page.
      return { kind: 'photoCaptured', imageUri: event.imageUri };

    case 'retake':
      return { kind: 'idle' };

    case 'usePhoto':
      // Only from a confirmed photo, so a double tap cannot start two recognitions.
      return state.kind === 'photoCaptured' ? { kind: 'processing', imageUri: state.imageUri } : state;

    case 'ocrDone': {
      if (state.kind !== 'processing') return state;
      const text = event.text.trim();
      // Nothing usable is a FAILURE, not an empty success: an empty review screen tells a parent
      // the app worked when it did not.
      if (text.length === 0) return { kind: 'ocrFailed', imageUri: state.imageUri, reason: 'noText' };
      return event.confident
        ? { kind: 'ocrSuccess', imageUri: state.imageUri, text }
        : { kind: 'ocrPartial', imageUri: state.imageUri, text };
    }

    case 'ocrFailed':
      if (state.kind !== 'processing') return state;
      return { kind: 'ocrFailed', imageUri: state.imageUri, reason: event.reason };

    case 'enterManually':
      // THE ESCAPE HATCH, and it is reachable from every failure state. A parent must never be
      // stuck with a worksheet the engine cannot read and no way to get the words in.
      return { kind: 'review', imageUri: imageOf(state), text: '' };

    case 'review':
      if (state.kind === 'ocrSuccess' || state.kind === 'ocrPartial') {
        return { kind: 'review', imageUri: state.imageUri, text: state.text };
      }
      return state;

    case 'editText':
      return state.kind === 'review' ? { ...state, text: event.text } : state;

    case 'saved':
      return { kind: 'saved', assignmentId: event.assignmentId };

    case 'reset':
      return initialScanState;
  }
}

/** The photo attached to a state, if it still has one. */
export function imageOf(state: ScanState): string | null {
  switch (state.kind) {
    case 'photoCaptured':
    case 'processing':
    case 'ocrSuccess':
    case 'ocrPartial':
      return state.imageUri;
    case 'ocrFailed':
    case 'review':
      return state.imageUri;
    default:
      return null;
  }
}

/** Whether the UI should show a busy indicator. Exactly one state qualifies. */
export function isBusy(state: ScanState): boolean {
  return state.kind === 'processing';
}

/** What to say when extraction did not work. Never blames the parent, always offers a way on. */
export function failureMessage(reason: ScanFailure): { title: string; body: string } {
  switch (reason) {
    case 'engineUnavailable':
      return {
        title: 'Text reading is not available here',
        body: 'This device build does not include text recognition. You can still type the assignment in yourself.',
      };
    case 'noText':
      return {
        title: 'We could not read anything clearly',
        body: 'Try another photo with more light, holding the page flat — or type the assignment in yourself.',
      };
    case 'engineError':
      return {
        title: 'Something went wrong reading the photo',
        body: 'Try taking the photo again, or type the assignment in yourself.',
      };
    case 'noCamera':
      return {
        title: 'The camera is not available',
        body: 'You can choose a photo from your library instead, or type the assignment in yourself.',
      };
  }
}
