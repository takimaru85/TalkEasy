import type { AnswerMethod, AssistanceLevel, Choice, LessonActivity } from './types';
import { ASSISTANCE_META } from './types';

const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  ten: '10', eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15', sixteen: '16',
  seventeen: '17', eighteen: '18', nineteen: '19', twenty: '20', thirty: '30', forty: '40', fifty: '50',
  sixty: '60', seventy: '70', eighty: '80', ninety: '90', hundred: '100',
  // Filipino
  isa: '1', dalawa: '2', tatlo: '3', apat: '4', lima: '5', anim: '6', pito: '7', walo: '8', siyam: '9', sampu: '10',
};

/**
 * Normalises a typed or spoken answer so "Ten.", "ten" and "10" all compare equal.
 * Lower-case, strip punctuation, collapse spaces, map number words to digits.
 */
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => NUMBER_WORDS[w] ?? w)
    .join(' ')
    .trim();
}

/**
 * True when the child's free-form answer (typed / spoken) matches one of the accepted answers.
 * A spoken sentence that CONTAINS the answer counts ("plants need sunlight to grow" ⊇ "sunlight"),
 * because the objective is the concept, not the exact wording.
 */
export function matchesFreeAnswer(given: string, accepted: string[]): boolean {
  const g = normalizeAnswer(given);
  if (!g) return false;
  return accepted.some((a) => {
    const n = normalizeAnswer(a);
    if (!n) return false;
    if (g === n) return true;
    // whole-word containment
    return ` ${g} `.includes(` ${n} `);
  });
}

/** Accepted answers for an activity: explicit answers plus the labels of correct choices. */
export function acceptedAnswers(activity: LessonActivity): string[] {
  const fromChoices = activity.choices.filter((c) => c.correct).map((c) => c.label);
  return [...activity.answers, ...fromChoices];
}

/**
 * Trims the choice list to the assistance level (guided = 2, assisted = 3, independent = all),
 * always keeping every correct choice and a stable order.
 */
export function choicesForLevel(choices: Choice[], level: AssistanceLevel): Choice[] {
  const max = ASSISTANCE_META[level].choices;
  if (choices.length <= max) return choices;
  const correct = choices.filter((c) => c.correct);
  const wrong = choices.filter((c) => !c.correct);
  const keepWrong = Math.max(1, max - correct.length);
  return [...correct, ...wrong.slice(0, keepWrong)].sort((a, b) => choices.indexOf(a) - choices.indexOf(b));
}

/**
 * Which methods to offer for an activity, in the order they should appear.
 * The child's preferred method goes first; on the guided level, tap/picture lead.
 */
export function orderedMethods(activity: LessonActivity, preferred: AnswerMethod | null, level: AssistanceLevel): AnswerMethod[] {
  const allowed: AnswerMethod[] = activity.allowedMethods.length ? activity.allowedMethods : ['tap', 'assisted'];
  const base: AnswerMethod[] = [...allowed];
  const priority: AnswerMethod[] = level === 'independent' ? ['type', 'speak', 'tap', 'picture', 'match', 'write', 'assisted'] : ['tap', 'picture', 'match', 'speak', 'type', 'write', 'assisted'];
  base.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
  if (preferred && base.includes(preferred)) {
    base.splice(base.indexOf(preferred), 1);
    base.unshift(preferred);
  }
  // Tap/picture only make sense when there are choices to show.
  return base.filter((m) => ((m === 'tap' || m === 'picture') ? activity.choices.length > 0 : m === 'match' ? activity.pairs.length > 0 : true));
}
