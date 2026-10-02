import type { ColorArtName } from '@/components/adventure/ColorArt';
import type { AdventureKey } from '@/theme/adventure';
import type { SpeechStageId } from './stages';

/**
 * The illustration each Speech Practice stage wears, by stage id. Stages are code, five of them in
 * the order speech is built, and `check:themes` fails if one has no drawing. Most reuse art the app
 * already has: the megaphone, the letter blocks, the book and the tracing page.
 *
 * Pure (type-only imports) so the check can compare it with the stage list.
 */
export const STAGE_ART: Record<SpeechStageId, ColorArtName> = {
  sounds: 'stat:sounds',
  syllables: 'subject:english',
  words: 'category:reading',
  phrases: 'stat:bubbles',
  sentences: 'stat:tracing',
};

/**
 * The illustration for each Speech Practice ACTIVITY, by id (both modules: Speech Practice's own and the
 * sound-ladder activities in `practice`). There are twenty and each wears its own; `check:themes` fails
 * if an activity in any stage has none. A few reuse a drawing the app already has (see ColorArt).
 */
export const ACTIVITY_ART: Record<string, ColorArtName> = {
  // Sounds
  soundListen: 'practice:soundListen',
  sounds: 'practice:sounds',
  matching: 'practice:matching',
  soundSay: 'practice:soundSay',
  imitation: 'practice:imitation',
  // Syllables
  syllables: 'practice:syllables',
  soundSyllable: 'practice:soundSyllable',
  rhythm: 'practice:rhythm',
  // Words
  words: 'practice:words',
  soundWord: 'practice:soundWord',
  repetition: 'practice:repetition',
  pictureNaming: 'practice:pictureNaming',
  // Phrases
  phrases: 'practice:phrases',
  soundPhrase: 'practice:soundPhrase',
  voice: 'practice:voice',
  // Sentences
  sentences: 'practice:sentences',
  soundSentence: 'practice:soundSentence',
  questions: 'practice:questions',
  stories: 'practice:stories',
  soundChat: 'practice:soundChat',
};

/** The drawing for an activity id, or undefined for one that is not a Speech Practice activity. */
export function activityArtFor(id: string | undefined): ColorArtName | undefined {
  return id ? ACTIVITY_ART[id] : undefined;
}

/**
 * The colours a stage's tiles take, in order. COORDINATED, not one family: the reference gives every
 * tile its own colour so a child can tell the activities apart at a glance, and each stage keeps its own
 * mood (Words leans green, Phrases purple and orange, Sentences teal). Neighbours never share one —
 * `check:stages` asserts it. A stage with more tiles than colours wraps round.
 */
export const STAGE_TILE_COLORS: Record<SpeechStageId, AdventureKey[]> = {
  sounds: ['sky', 'grape', 'grass', 'sun', 'reef'],
  syllables: ['grape', 'sun', 'magenta'],
  words: ['grass', 'sky', 'sun', 'reef'],
  phrases: ['grape', 'sun', 'magenta'],
  sentences: ['reef', 'sky', 'grape', 'grass', 'coral'],
};

/** The colour for tile `index` of a stage. */
export function tileColorFor(stage: SpeechStageId, index: number): AdventureKey {
  const row = STAGE_TILE_COLORS[stage];
  return row[index % row.length];
}

/**
 * How many tiles go in each row of a stage. Five tiles are three over two, as in the reference; a narrow
 * phone (under 340pt of content) cannot give three across room for a label, so it drops to twos. The last
 * row's tiles stretch to fill it, so a row of two is wider than a row of three, not left-aligned and ragged.
 */
export const THREE_ACROSS_MIN_WIDTH = 340;
/** Four across needs a tablet's width, whatever the column count says. */
export const TABLET_MIN_WIDTH = 600;

export function stageTileRows(count: number, contentWidth: number, columns = 2): number[] {
  const wide = contentWidth >= THREE_ACROSS_MIN_WIDTH;
  if (count <= 0) return [];
  // The shared responsive column count (`sizes.gridColumns`): a tablet puts up to four across, one row.
  if (columns >= 4 && contentWidth >= TABLET_MIN_WIDTH && count <= 4) return [count];
  if (count === 3) return wide ? [3] : [2, 1];
  if (count === 5) return wide ? [3, 2] : [2, 2, 1];
  if (count === 6) return wide ? [3, 3] : [2, 2, 2];
  const rows: number[] = [];
  for (let left = count; left > 0; left -= 2) rows.push(Math.min(2, left));
  return rows;
}

/** The width of one tile in a row of `perRow`, with `gap` between them. */
export function stageTileWidth(contentWidth: number, perRow: number, gap: number): number {
  return Math.floor((contentWidth - gap * (perRow - 1)) / perRow);
}

/** The illustration on each step of a sound target (BA, BE...) — the same drawings as the activities they echo. */
export const TARGET_STEP_ART: Record<string, ColorArtName> = {
  listen: 'practice:soundListen',
  say: 'practice:soundSay',
  words: 'practice:words',
  phrase: 'practice:soundPhrase',
  sentence: 'practice:soundSentence',
  play: 'practice:matching',
};
