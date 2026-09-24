/**
 * Speech Practice — data model.
 *
 * Speech Practice is a PRACTICE aid (Listen → Look → Try → Repeat → Encourage → Continue), in
 * the same spirit as Sound Practice (src/soundpractice): nothing is scored, nothing is
 * transcribed, and no result is ever presented as clinical. The DB records that practice
 * happened, never how well it went.
 *
 * Every activity is built from a handful of reusable exercise KINDS, so adding content means
 * adding data, never a new screen:
 *
 *   say    — hear a model, optionally record yourself (or do an action), move on
 *   choose — hear / see a prompt, tap a picture or word (listening, naming, questions…)
 *   build  — tap a sentence starter, then a picture, hear the whole sentence
 *   story  — a few picture pages, then choose-questions about them
 *   turns  — "my turn / your turn" game
 *   clap   — tap along with the syllables of a word, no timing
 */

import type { Strings } from '@/i18n/types';

export type SpeechLevel = 'beginner' | 'intermediate' | 'advanced';

export type ActivityId =
  | 'sounds'
  | 'syllables'
  | 'words'
  | 'listening'
  | 'matching'
  | 'pictureNaming'
  | 'imitation'
  | 'repetition'
  | 'phrases'
  | 'sentences'
  | 'questions'
  | 'stories'
  | 'directions'
  | 'vocabulary'
  | 'turnTaking'
  | 'social'
  | 'rolePlay'
  | 'memory'
  | 'rhythm'
  | 'voice';

/** One thing that can be shown, heard and practised. */
export interface SpeechItem {
  /** Stable key — never translated, safe to log. */
  id: string;
  /** What is shown. English practice content. */
  text: string;
  /** Emoji or MaterialCommunityIcons glyph name (both offline). */
  picture?: string;
  /** A parent's photo (My Words), shown instead of `picture`. */
  imageUri?: string | null;
  /** What the voice says, when it differs from `text` (e.g. "mah" for "MA"). */
  speak?: string;
  /**
   * A recorded model: a bundled `require(...)` or an on-device file URI. When present it plays
   * instead of text-to-speech — the route to professional recordings, with no screen changes.
   */
  audio?: number | string;
  /** An isolated speech sound: played through Sound Practice's cue ("buh", not "bee"). */
  soundId?: string;
  /** Speech-rate multiplier for the model (Voice Practice: fast / slow). */
  rate?: number;
  /** Translate `text` from the UI strings instead (Same / Different, My turn…). */
  labelKey?: keyof Strings;
  /**
   * The item's model recording: "syllable:ba", "word:v-ball"… (pronunciation.ts `modelKey`).
   * Looked up in the bundled files, then in the parent's on-device recordings.
   */
  modelKey?: string;
  /**
   * The model MUST be a recording. Without one the child is told the model is not ready —
   * text-to-speech is never used, because an engine guesses at "BO" / "BE" and gets it wrong.
   */
  strict?: boolean;
}

export interface SayExercise {
  kind: 'say';
  id: string;
  item: SpeechItem;
  /** Scene shown above the item (Role Play: 🏫 At school). */
  context?: SpeechItem;
  /** Extra line under the item (Voice Practice: "Say it quietly"). */
  hint?: string;
  /** 'speak' offers the microphone; 'action' asks for a movement and an "I did it" tap. */
  mode: 'speak' | 'action';
}

export interface ChooseExercise {
  kind: 'choose';
  id: string;
  /** Shown instruction. English practice content, or a UI key via `promptKey`. */
  prompt?: string;
  promptKey?: keyof Strings;
  /** Played on open and on "Listen again". */
  listen: SpeechItem[];
  /** A picture shown above the choices (Picture Naming, WH-question scenes). */
  show?: SpeechItem[];
  /** Pictures shown first and then hidden (Memory). The child taps "I'm ready" — no timer. */
  preview?: SpeechItem[];
  choices: SpeechItem[];
  /** The ids that are right. More than one = find them all (Memory, two-step directions). */
  answerIds: string[];
  /** Answers must be tapped in `answerIds` order (two-step directions). */
  ordered?: boolean;
  /** 'picture' = big picture cards; 'text' = the text is the thing (letters, words). */
  display: 'picture' | 'text';
  /** Offer the microphone too, so a child can say the answer as well as tap it. */
  allowSay?: boolean;
}

export interface SentenceFrame {
  id: string;
  /** "I want" */
  starter: string;
  /** Pictures that stand for the starter words: 👦 ❤️ */
  pictures: string[];
  /** The article this frame puts before a countable noun. */
  article: 'a' | 'the' | 'none';
}

export interface BuildExercise {
  kind: 'build';
  id: string;
  frame: SentenceFrame;
  cards: SpeechItem[];
}

export interface StoryPage {
  picture: string;
  text: string;
}

export interface StoryExercise {
  kind: 'story';
  id: string;
  title: string;
  pages: StoryPage[];
  questions: ChooseExercise[];
}

export interface TurnGame {
  id: string;
  /** 🎲 Roll / 🎨 Choose / 🧩 Match */
  item: SpeechItem;
  /** What a turn can produce. 'roll' picks for you; 'pick' lets the child choose. */
  options: SpeechItem[];
  style: 'roll' | 'pick';
  rounds: number;
}

export interface TurnsExercise {
  kind: 'turns';
  id: string;
  game: TurnGame;
}

export interface ClapExercise {
  kind: 'clap';
  id: string;
  item: SpeechItem;
  /** ["BA", "NA", "NA"] */
  beats: string[];
}

export type Exercise = SayExercise | ChooseExercise | BuildExercise | StoryExercise | TurnsExercise | ClapExercise;

/** A group the child picks first (Vocabulary: Animals, Food…; Social: Greetings…). */
export interface ActivityCategory {
  key: string;
  name: string;
  picture: string;
}

export interface ActivityDef {
  id: ActivityId;
  emoji: string;
  /** Line icon (MaterialCommunityIcons) and soft tint — the interface icon, drawn as an IconTile. */
  icon: string;
  tint: string;
  titleKey: keyof Strings;
  level: SpeechLevel;
  /** Screens with their own flow (Sounds re-uses the Sound Practice screens). */
  route?: 'SoundPractice';
}

/** One practised word from the parent (a Talk card marked "use in Speech Practice"). */
export interface MyWord {
  id: number;
  label: string;
  phrase: string;
  icon: string;
  imageUri: string | null;
}

/** What a practice event records. Never audio, never correctness. */
export type SpeechEventKind =
  /** One try: a recording, a tap on an answer, an "I did it", a played sentence. */
  | 'attempt'
  /** One exercise finished (the child moved on after trying it). */
  | 'exercise'
  /** A whole activity set finished. */
  | 'complete'
  /** Time spent in an activity. */
  | 'session';

export interface SpeechEventInput {
  activityId: ActivityId;
  kind: SpeechEventKind;
  item?: string;
  durationMs?: number;
}

/** "Today's practice" — counts and minutes, never a score. */
export interface SpeechPracticeStats {
  activitiesCompleted: number;
  wordsPracticed: number;
  attempts: number;
  practiceMs: number;
}

export interface ActivityPracticeRow {
  activityId: string;
  exercises: number;
  attempts: number;
  practiceMs: number;
}

export interface PracticeDay {
  /** YYYY-MM-DD, local. */
  date: string;
  exercises: number;
  attempts: number;
  practiceMs: number;
}
