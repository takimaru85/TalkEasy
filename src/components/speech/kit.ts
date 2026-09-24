import type { SoundRecorder } from '@/hooks/useSoundRecorder';
import type { SpeechItem } from '@/speechpractice/types';
import type { CommunicationButton } from '@/types/models';

/**
 * Everything an exercise view needs from the activity screen. The screen owns audio, the
 * microphone and tracking; views only lay out one exercise. That is what keeps 20 activities
 * on one screen instead of twenty.
 */
export interface PracticeKit {
  /** Plays the model for these items (a recording, a sound cue or the device voice). */
  play: (items: SpeechItem[]) => void;
  /**
   * Where the item's model comes from: a recording, the device voice (words and phrases without a
   * recording), or 'missing' — a syllable with no recording, which is never replaced by TTS.
   */
  modelStatus: (item: SpeechItem) => 'recording' | 'voice' | 'missing';
  /** Speaks a UI line (praise, "Let's listen again") in the child's language. Respects Sound. */
  speakUi: (text: string) => void;
  /** What to show for an item (translates Same / Different…). */
  label: (item: SpeechItem) => string;
  /** Records one try. Never a result — only that it happened. */
  attempt: (item: string, durationMs?: number) => void;
  /** Story / Turn Taking: the exercise has reached its end, show "Next". */
  finish: () => void;
  recorder: SoundRecorder;
  micDeclined: boolean;
  declineMic: () => void;
  praiseIndex: number;
  nextPraise: () => void;
  /** The Talk card for this item, when the child's communication board has one. */
  talkButtonFor: (item: SpeechItem) => CommunicationButton | null;
  /** Says it the way Talk does — records the tap, so practice becomes communication. */
  sayAsTalk: (button: CommunicationButton) => void;
}
