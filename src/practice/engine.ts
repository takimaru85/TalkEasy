import { PRACTICE_ACTIVITIES, PRACTICE_AREAS, PRACTICE_CONTENT, activitiesIn } from './content';
import type {
  PracticeActivityDef,
  PracticeAreaDef,
  PracticeAreaId,
  PracticeExercise,
  VoiceLine,
} from './types';

/**
 * Voice & Communication — turning content into a session.
 *
 * There is deliberately very little here. Speech Practice's engine composes exercises from
 * vocabulary at runtime; this module's content is already written as exercises, because an
 * intonation example only works when the words and the voice were chosen together — a generated
 * pairing would produce sentences nobody would ever say that way.
 *
 * So the engine's whole job is: hand back an activity's exercises, in a sensible order, and
 * answer questions about coverage. Everything a child meets is visible in content.ts.
 */

export function getCategory(id: string): PracticeAreaDef | undefined {
  return PRACTICE_AREAS.find((c) => c.id === id);
}

export function getActivity(id: string): PracticeActivityDef | undefined {
  return PRACTICE_ACTIVITIES.find((a) => a.id === id);
}

/**
 * The exercises for an activity.
 *
 * Order is the order in content.ts, never shuffled: these activities build on each other (hear the
 * pattern, then make it), and a child who has learned where they are in a sequence should find it
 * in the same place tomorrow.
 */
export function buildExercises(activityId: string): PracticeExercise[] {
  return PRACTICE_CONTENT[activityId] ?? [];
}

/** Activities in an area, for the area's screen. */
export function activitiesFor(category: PracticeAreaId): PracticeActivityDef[] {
  return activitiesIn(category);
}

/** How many activities an area has — the denominator for its coverage bar. */
export function activityCount(category: PracticeAreaId): number {
  return activitiesIn(category).length;
}

/**
 * A short, stable label for an exercise, for the practice log and the parent summary.
 *
 * It names the ACTIVITY's subject, never the child's words and never their attempt — the log has
 * to stay something a grown-up can read without it becoming a record of how a child spoke.
 */
export function exerciseLabel(ex: PracticeExercise): string {
  switch (ex.kind) {
    case 'listen-choose':
      return ex.listen.map((l) => l.text).join(' / ');
    case 'voice-try':
      return ex.line.text;
    case 'focus-say':
      return ex.readings[0]?.text ?? '';
    case 'turn-light':
      return ex.ask.text;
    case 'exchange':
      return ex.turns[0]?.line.text ?? '';
    case 'wait-go':
      return ex.intro.text;
    case 'beat':
      return String(ex.beats);
    case 'copy-action':
      return ex.line.text;
    case 'say-more':
      return ex.rungs[0]?.text ?? '';
    case 'arrange':
      return ex.words.join(' ');
  }
}

/** Every line an exercise may play, in the order it plays them. */
export function linesOf(ex: PracticeExercise): VoiceLine[] {
  switch (ex.kind) {
    case 'listen-choose':
      return ex.listen;
    case 'voice-try':
      return [ex.line];
    case 'focus-say':
      return ex.readings;
    case 'turn-light':
      return [ex.ask];
    case 'exchange':
      return ex.turns.map((t) => t.line);
    case 'wait-go':
      return [ex.intro];
    case 'beat':
      return []; // beats are drawn and felt, not spoken
    case 'copy-action':
      return [ex.line];
    case 'say-more':
      return ex.rungs;
    case 'arrange':
      return [{ id: ex.id, text: ex.words.join(' ') }];
  }
}

/**
 * Whether an exercise can be completed without speaking.
 *
 * Every one of them can, and that is the point: a child who cannot produce the target speech still
 * does the listening, the choosing and the turn-taking, and their practice counts the same. If
 * this ever returns false for something, the activity has stopped being accessible.
 */
export function voiceOptional(ex: PracticeExercise): boolean {
  switch (ex.kind) {
    case 'listen-choose':
      return true; // tapping is the whole exercise
    case 'voice-try':
      return ex.optionalVoice;
    case 'focus-say':
    case 'turn-light':
    case 'exchange':
    case 'wait-go':
    case 'beat':
    case 'copy-action':
    case 'say-more':
    case 'arrange':
      return true; // tapping is the whole exercise
  }
}

export { PRACTICE_ACTIVITIES, PRACTICE_AREAS, PRACTICE_CONTENT };
