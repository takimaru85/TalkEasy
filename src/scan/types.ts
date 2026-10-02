/**
 * Scan Assignment — types and the state machine. Pure: no React, no camera, no OCR engine, so the
 * checks can prove the flow without a device.
 *
 * THE SHAPE OF THE FEATURE: photo → text → review → read aloud → (optionally) save or make an
 * activity. The valuable part is the middle — a parent getting the words off a worksheet and into
 * something their child can have read to them. Everything else serves that.
 *
 * TWO RULES THAT THE TYPES ENFORCE:
 *
 *  1. `extractedText` is what the engine read, and it is NEVER rewritten. `editedText` is what the
 *     grown-up has since corrected. Keeping them apart is what lets someone go back to the original
 *     after an edit goes wrong, and it is why the parser is handed a copy rather than the record.
 *  2. The parser NEVER modifies the assignment. It reads text and reports what it thinks the text
 *     is; `parsed` sits beside the text rather than replacing it.
 */
import type { ScanLanguage } from './language';

/**
 * Where the flow is. ONE value, not six booleans.
 *
 * A scan has a lot of failure modes — permission refused, no camera, a blurry photo, an engine that
 * is not installed — and the version of this screen with `isLoading`, `isProcessing`, `isError` and
 * `isSaving` all set independently is the version where a parent ends up looking at a spinner over
 * an error. One state, one thing on screen.
 */
export type ScanState =
  | { kind: 'idle' }
  /** A photo has been taken or chosen and is waiting to be confirmed. */
  | { kind: 'photoCaptured'; imageUri: string }
  | { kind: 'processing'; imageUri: string }
  /** Text came back and is worth showing. */
  | { kind: 'ocrSuccess'; imageUri: string; text: string }
  /** Something came back, but not confidently — say so rather than present it as correct. */
  | { kind: 'ocrPartial'; imageUri: string; text: string }
  /** Nothing usable came back, or no engine is available on this device. */
  | { kind: 'ocrFailed'; imageUri: string | null; reason: ScanFailure }
  /** The grown-up is reviewing and editing the text. */
  | { kind: 'review'; imageUri: string | null; text: string }
  | { kind: 'saved'; assignmentId: number }
  | { kind: 'error'; message: string };

/** Why text extraction did not produce something usable. Each has its own wording on screen. */
export type ScanFailure =
  /** No text recognition on this device (Expo Go, the web preview, a build without the module). */
  | 'engineUnavailable'
  /** The engine ran and found nothing. */
  | 'noText'
  /** The engine itself failed. */
  | 'engineError'
  /** The camera could not be opened or was refused. */
  | 'noCamera';

/** What the parser thinks a piece of text is. 'unknown' is a perfectly good answer. */
export type AssignmentType = 'reading' | 'vocabulary' | 'spelling' | 'math' | 'unknown';

/**
 * The parser's reading of the text. NEVER replaces the text it came from.
 *
 * `items` is populated only for the types that have a list (vocabulary, spelling, math); `content`
 * only for reading. An `unknown` result carries neither, and that is the honest answer for most
 * real worksheets.
 */
export interface ParsedAssignment {
  type: AssignmentType;
  title: string;
  instructions: string;
  items: string[];
  content: string;
  /**
   * Whether the parser is confident enough for the app to OFFER an activity.
   *
   * Deliberately separate from `type`: a guess at the type is useful for a label, but building an
   * activity out of a misread worksheet wastes a child's time, so the bar for acting is higher than
   * the bar for labelling.
   */
  canMakeActivity: boolean;
}

/** A scan the family has kept. Stored as an ordinary assignment — see database/schema migration 15. */
export interface ScannedAssignment {
  id: number;
  title: string;
  /** The photo, in app-private storage. Null if the family chose not to keep it. */
  imageUri: string | null;
  /** What the engine read. Never rewritten. */
  extractedText: string;
  /** What the grown-up corrected it to. Starts equal to `extractedText`. */
  editedText: string;
  language: ScanLanguage;
  type: AssignmentType;
  createdAt: string;
  updatedAt: string;
}
