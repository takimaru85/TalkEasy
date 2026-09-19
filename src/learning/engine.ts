import type { Difficulty } from '@/types/models';
import type { Option, Question, Rng } from './types';

/** Questions per practice session. Kept short so a session ends before attention does. */
export const QUESTIONS_PER_SESSION = 6;

/** Number of answer buttons by difficulty (2 = easy, 4 = hard). */
export const OPTION_COUNT: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 };

export function createRng(seed = Date.now()): Rng {
  // mulberry32 — tiny, good enough for shuffling practice questions.
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng: Rng = {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    sample: (arr, n) => rng.shuffle(arr).slice(0, n),
  };
  return rng;
}

/**
 * Builds a multiple-choice question: the correct option plus distractors drawn from `pool`
 * (anything equal to the correct label is skipped), shuffled, sized by difficulty.
 */
export function mcq(
  rng: Rng,
  difficulty: Difficulty,
  prompt: string,
  correct: Option,
  pool: readonly Option[],
  extra: { promptEmoji?: string; speak?: string; explain?: string } = {},
): Question {
  const count = OPTION_COUNT[difficulty];
  const distractors = rng
    .shuffle(pool.filter((o) => o.label !== correct.label))
    .slice(0, count - 1);
  const options = rng.shuffle([correct, ...distractors]);
  return {
    prompt,
    promptEmoji: extra.promptEmoji,
    speak: extra.speak,
    options,
    answer: options.findIndex((o) => o.label === correct.label),
    explain: extra.explain,
  };
}

/** Numeric distractors near `answer`, never negative, never equal to it. */
export function numberOptions(rng: Rng, difficulty: Difficulty, answer: number, spread = 3): Option[] {
  const count = OPTION_COUNT[difficulty];
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < count && guard++ < 50) {
    const candidate = answer + rng.int(-spread, spread);
    if (candidate >= 0 && candidate !== answer) set.add(candidate);
  }
  while (set.size < count) set.add(Math.max(...set) + 1);
  return rng.shuffle([...set]).map((n) => ({ label: String(n) }));
}

export function numericQuestion(
  prompt: string,
  answer: number,
  options: Option[],
  extra: { promptEmoji?: string; speak?: string; explain?: string } = {},
): Question {
  return {
    prompt,
    promptEmoji: extra.promptEmoji,
    speak: extra.speak,
    options,
    answer: options.findIndex((o) => o.label === String(answer)),
    explain: extra.explain,
  };
}

/** Repeats an emoji `n` times, wrapping into rows of 5 so it stays readable. */
export function emojiGroup(emoji: string, n: number): string {
  const rows: string[] = [];
  for (let i = 0; i < n; i += 5) rows.push(emoji.repeat(Math.min(5, n - i)));
  return rows.join('\n');
}

/** Picks `n` distinct items from a bank as questions via `make`. */
export function fromBank<T>(rng: Rng, bank: readonly T[], n: number, make: (item: T) => Question): Question[] {
  return rng.sample(bank, Math.min(n, bank.length)).map(make);
}
