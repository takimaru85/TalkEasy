import type { Strings } from '@/i18n/types';
import type { AreaPurpose } from '@/theme/purpose';

/**
 * Voice & Communication — data model.
 *
 * WHAT THIS IS. Speech Practice asks "can you say this sound?". This section asks the other half
 * of the question: what does your VOICE do while you say it, and what happens between two people
 * talking. It practises pitch, loudness, speed, which word carries the weight, whose turn it is,
 * and how to answer somebody — as listening and as speaking.
 *
 * WHAT THIS IS NOT. It is not assessment, and nothing here may ever become assessment. The app
 * does not analyse the child's voice: it records an attempt, plays it straight back, and deletes
 * it (useSoundRecorder). There is no pitch detection, no scoring and no comparison against the
 * model, because the moment a machine grades a child's intonation this stops being practice. The
 * progress numbers count PRACTICE DONE, never quality — the same rule as Sound and Speech
 * Practice, and the reason the events table has no correctness column.
 *
 * NOTHING HERE DIAGNOSES ANYTHING. No wording in this module may suggest a disorder, a delay, a
 * clinical score or a norm, and `check:voice` fails the build on a list of banned words.
 *
 * TWO THINGS THE CONTENT MUST NEVER DO:
 *  1. Teach that a question always rises. English questions do not, and a child taught the rule
 *     will be wrong constantly. Every pitch activity is "here are two patterns, hear the
 *     difference, make them" — never "this is the correct pattern for a question".
 *  2. Tie one pitch pattern to one feeling. "Really?" can be surprise, doubt or delight. Choices
 *     that name a meaning are always framed as what this example sounds like, never as a rule.
 *
 * Exercises are built from five reusable KINDS, so adding an activity is adding data:
 *
 *   listen-choose — hear one or two models, then tap what you heard
 *   voice-try     — hear a model, see its shape, try it yourself, hear yourself back
 *   focus-say     — a sentence with one word carrying the weight; hear it, then say it
 *   turn-light    — a traffic light: listen, get ready, your turn
 *   exchange      — a short two-person conversation, a line at a time
 */

/** The shape a voice makes, drawn by components/voice/VoiceShapeTrace. */
export type VoiceShape =
  | 'rise' | 'fall' | 'rise-fall' | 'fall-rise' | 'flat'
  | 'high' | 'low'
  | 'loud' | 'soft'
  | 'fast' | 'slow';

/** The six practice areas, each its own card on the section's home screen. */
export type PracticeAreaId =
  | 'attention'
  | 'early'
  | 'sounds'
  | 'understanding'
  | 'expressive'
  | 'intonation'
  | 'listening'
  | 'turns'
  | 'focus'
  | 'conversation'
  | 'expression';

export const PRACTICE_AREA_IDS: PracticeAreaId[] = [
  'attention', 'early', 'sounds', 'understanding', 'expressive',
  'intonation', 'listening', 'turns', 'focus', 'conversation', 'expression',
];

export type VoiceLevel = 'beginner' | 'intermediate' | 'advanced';

/** Something the app can say and show. Deliberately the same shape as a SpeechItem's essentials. */
export interface VoiceLine {
  /** Stable key — never translated, safe to log. */
  id: string;
  /** What is shown and, unless `speak` says otherwise, what is said. */
  text: string;
  /** What the voice says, when it differs from the text. */
  speak?: string;
  /** Emoji shown with the line. */
  picture?: string;
  /** The voice's shape for this reading — drives the trace and the model's delivery. */
  shape?: VoiceShape;
  /**
   * The word within `text` that carries the weight, by index (0-based, split on spaces). The
   * screen draws it larger and brighter; the model says it with more room around it.
   */
  focusWord?: number;
  /** Speech-rate multiplier for the model. Used by fast / slow, never to rush a child. */
  rate?: number;
  /** Pitch multiplier for the model. Used by high / low. */
  pitch?: number;
  /** A recorded model (bundled require or on-device uri). Plays instead of text-to-speech. */
  audio?: number | string;
  /**
   * The line IS an isolated speech sound (a soundpractice/content id, e.g. 'g'): the model is that
   * sound's phoneme, played by soundPracticeAudio.playPhoneme — never `text` ("G") or a respelling.
   */
  soundId?: string;
}

/** Hear one or two models, then tap what you heard. The listening half of every area. */
export interface ListenChooseExercise {
  kind: 'listen-choose';
  id: string;
  /** The question, in the child's words. */
  promptKey: keyof Strings;
  /** Played on open and on "Listen again". Two lines = a comparison. */
  listen: VoiceLine[];
  choices: VoiceChoice[];
  /**
   * The expected choice, or choices. More than one means "find them all" — a two-step instruction
   * or a remembered sequence. Never a score: an unexpected tap replays the model and invites
   * another go.
   */
  answerIds: string[];
  /** The answers must be tapped in `answerIds` order (a two-step instruction). */
  ordered?: boolean;
  /** Draw each listened line's shape above the choices, after the first listen. */
  showShapes?: boolean;
}

export interface VoiceChoice {
  id: string;
  /**
   * Shown label, from the UI strings — for choices that are INTERFACE words ("The same", "Up").
   * Exactly one of `labelKey` or `text` is set; `check:practice` fails on neither or both.
   */
  labelKey?: keyof Strings;
  /**
   * Shown label as plain English, for choices that are PRACTICE CONTENT ("dog", "red ball").
   * These are the thing being practised rather than interface text, so they live in content.ts
   * with the rest of it — the same rule the practice sentences follow.
   */
  text?: string;
  /** Emoji or a shape to draw on the choice. */
  picture?: string;
  shape?: VoiceShape;
}

/** Hear a model, see its shape, try it, hear yourself. No comparison is made. */
export interface VoiceTryExercise {
  kind: 'voice-try';
  id: string;
  line: VoiceLine;
  /** The invitation, e.g. "Can you make your voice go up?". */
  cueKey: keyof Strings;
  /**
   * A child who cannot or does not want to speak taps "I listened" instead and the exercise
   * counts exactly the same. Voice is never required to make progress.
   */
  optionalVoice: true;
}

/** A sentence where one word carries the weight. */
export interface FocusSayExercise {
  kind: 'focus-say';
  id: string;
  /** The same words, read two ways, so the child hears the weight move. */
  readings: VoiceLine[];
  /** Asks which word sounded strongest; omitted when the activity is production only. */
  question?: { promptKey: keyof Strings; answerIds: string[] };
  cueKey: keyof Strings;
}

/** Listen, get ready, your turn — the traffic light. */
export interface TurnLightExercise {
  kind: 'turn-light';
  id: string;
  /** What the app says on RED. */
  ask: VoiceLine;
  /** Ideas the child can tap if they would rather choose than speak. */
  ideas: VoiceLine[];
  /** How long AMBER lasts, in ms. Generous by default and never a test of speed. */
  readyMs: number;
}

/** A short two-person conversation, one line at a time. */
export interface ExchangeExercise {
  kind: 'exchange';
  id: string;
  titleKey: keyof Strings;
  /** Alternating turns beginning with the app. */
  turns: ExchangeTurn[];
}

export interface ExchangeTurn {
  id: string;
  who: 'app' | 'child';
  /** The app's line, or the suggestion for the child's. */
  line: VoiceLine;
  /** For a child turn: other things they could say. Any of them moves on — none is "right". */
  alternatives?: VoiceLine[];
}

/**
 * Ready, steady… GO. Waiting for a cue before acting.
 *
 * This is an ATTENTION exercise, not a reaction test: the child is practising holding still until
 * they hear the word, and tapping early is answered with "wait for GO", never with a failure. The
 * wait grows across rounds because anticipating a longer pause is the skill.
 */
export interface WaitGoExercise {
  kind: 'wait-go';
  id: string;
  /** What is being got ready for ("Your rocket is ready"). */
  intro: VoiceLine;
  /** Silence between "steady" and "go", per round, in ms. Grows, but never beyond patience. */
  waits: number[];
}

/**
 * Copy the beats. Rhythm and sequence, with no speaking at all.
 *
 * NOTHING IS TIMED. The app plays a number of beats and the child taps that many; when they tap a
 * different number it plays them again and invites another go. Matching a tempo would make this a
 * motor test, and plenty of the children this is for cannot move quickly or evenly.
 */
export interface BeatExercise {
  kind: 'beat';
  id: string;
  /** How many beats to play. Two is the start; four is plenty. */
  beats: number;
  /** Gap between beats, in ms. Slower gaps are easier to count. */
  gapMs: number;
}

/**
 * Copy what the app does — clap, wave, stamp, blow.
 *
 * Imitation of a MOVEMENT, which comes before imitation of a sound and needs no voice at all. The
 * child taps "I did it" when they have had a go; the app cannot see them, so it never claims to
 * know whether they did, and there is no version of this the child can get wrong.
 *
 * A child who cannot make the movement taps anyway. The point is joining in, not performing.
 */
export interface CopyActionExercise {
  kind: 'copy-action';
  id: string;
  /** What to do, in words the app says aloud. */
  line: VoiceLine;
  /** Big picture of the action. */
  picture: string;
  /** An easier version for a child who cannot manage the first ("or just watch"). */
  gentlerKey?: keyof Strings;
}

/**
 * Say as much as you can — one word, two words, or the whole sentence.
 *
 * A picture with a LADDER of answers, all of them right. The child (or a grown-up beside them)
 * picks the rung they can manage today, hears it, and says it if they want to. This is the shape
 * expressive language actually grows in, and it means the same activity works for a child saying
 * single words and for one building sentences — nobody meets a version that is too hard.
 *
 * Crucially, choosing a shorter rung is never "less correct". The app records that the picture was
 * practised, not which rung was chosen.
 */
export interface SayMoreExercise {
  kind: 'say-more';
  id: string;
  picture: string;
  /** What is happening, asked aloud. */
  promptKey: keyof Strings;
  /** Shortest first. Two to four rungs. */
  rungs: VoiceLine[];
}

/**
 * Build the sentence by tapping its words.
 *
 * Word order, made physical. The words are offered jumbled and the child taps them into place; a
 * word tapped out of order is put back rather than marked wrong, and the sentence is spoken once
 * it is complete so the child hears what they built.
 */
export interface ArrangeExercise {
  kind: 'arrange';
  id: string;
  /** The finished sentence, in order. Each entry is one tappable word. */
  words: string[];
  picture?: string;
  promptKey: keyof Strings;
}

export type PracticeExercise =
  | ListenChooseExercise
  | VoiceTryExercise
  | FocusSayExercise
  | TurnLightExercise
  | ExchangeExercise
  | WaitGoExercise
  | BeatExercise
  | CopyActionExercise
  | SayMoreExercise
  | ArrangeExercise;

export interface PracticeActivityDef {
  id: string;
  category: PracticeAreaId;
  emoji: string;
  /** MaterialCommunityIcons name — validated against the glyphmap by check:voice. */
  icon: string;
  titleKey: keyof Strings;
  subtitleKey: keyof Strings;
  level: VoiceLevel;
}

export interface PracticeAreaDef {
  id: PracticeAreaId;
  emoji: string;
  icon: string;
  titleKey: keyof Strings;
  subtitleKey: keyof Strings;
  /**
   * What KIND of practice this is. The card's colour comes from it (theme/purpose.ts) rather
   * than being chosen per area, so colour means something across the whole list.
   */
  purpose: AreaPurpose;
  /**
   * Owned by another section and not listed on the Listen & Talk hub. The speech-sound ladder is
   * the only one: it IS Speech Practice's stages, and listing it twice is what "do not duplicate"
   * exists to prevent. Its activities stay reachable through those stages.
   */
  ownedElsewhere?: boolean;
}

/** What a practice event records. Never audio, never correctness — like every other module. */
export interface PracticeEventInput {
  activityId: string;
  category: PracticeAreaId;
  kind: PracticeExercise['kind'];
  /** A short label for the parent summary ("Rising voice"). Never the child's words. */
  item: string;
  durationMs: number;
}

export interface PracticeAreaProgress {
  category: PracticeAreaId;
  /** Exercises practised in this area, all time. */
  practised: number;
  /** Distinct activities touched in this area. */
  activities: number;
  /** 0..1 against the area's own activity count — "how much of this area have we tried". */
  coverage: number;
}
