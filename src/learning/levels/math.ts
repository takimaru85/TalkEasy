import { QUESTIONS_PER_SESSION as N, emojiGroup, mcq, numberOptions, numericQuestion } from '../engine';
import type { Option, Question, Rng } from '../types';
import type { Difficulty } from '@/types/models';
import { topicLevels, type LevelDef } from './bank';

const OBJECTS = ['🍎', '⭐', '🐟', '🎈', '🐶', '🌸', '🚗', '🍪', '🦋', '🐥'];

type Make = (step: number, tier: Difficulty, rng: Rng) => Question[];
const six = <T,>(fn: (i: number) => T): T[] => Array.from({ length: N }, (_, i) => fn(i));

// 1. Count the pictures, up to 5 at the start and 20 at the end.
const counting: Make = (step, tier, rng) =>
  six(() => {
    const max = 4 + step * 2;
    const n = rng.int(1, max);
    return numericQuestion('How many are there?', n, numberOptions(rng, tier, n, 2), {
      promptEmoji: emojiGroup(rng.pick(OBJECTS), n),
      speak: 'How many are there? Count them.',
      explain: `Yes! There are ${n}.`,
    });
  });

// 2. Add within 10 (the sum grows from 4 to 10).
const add10: Make = (step, tier, rng) =>
  six(() => {
    const total = Math.min(10, 3 + Math.ceil(step * 0.8));
    const a = rng.int(0, total);
    const b = rng.int(0, total - a);
    return numericQuestion(`${a} + ${b} = ?`, a + b, numberOptions(rng, tier, a + b, 3), {
      promptEmoji: `${emojiGroup('🔴', a)}  ➕  ${emojiGroup('🔵', b)}`.replace(/\n/g, ''),
      speak: `${a} plus ${b}. What is the answer?`,
      explain: `Yes! ${a} plus ${b} is ${a + b}.`,
    });
  });

// 3. Take away within 10.
const sub10: Make = (step, tier, rng) =>
  six(() => {
    const total = Math.min(10, 3 + Math.ceil(step * 0.8));
    const a = rng.int(1, total);
    const b = rng.int(0, a);
    return numericQuestion(`${a} − ${b} = ?`, a - b, numberOptions(rng, tier, a - b, 3), {
      speak: `${a} minus ${b}. What is the answer?`,
      explain: `Yes! ${a} minus ${b} is ${a - b}.`,
    });
  });

// 4. Add within 20, then within 50.
const add20: Make = (step, tier, rng) =>
  six(() => {
    const top = step <= 5 ? 10 + step * 2 : 20 + (step - 5) * 6;
    const a = rng.int(2, Math.floor(top * 0.7));
    const b = rng.int(1, top - a);
    return numericQuestion(`${a} + ${b} = ?`, a + b, numberOptions(rng, tier, a + b, 4), {
      speak: `${a} plus ${b}. What is the answer?`,
      explain: `Yes! ${a} plus ${b} is ${a + b}.`,
    });
  });

// 5. Take away within 20, then within 50.
const sub20: Make = (step, tier, rng) =>
  six(() => {
    const top = step <= 5 ? 10 + step * 2 : 20 + (step - 5) * 6;
    const a = rng.int(Math.floor(top * 0.5), top);
    const b = rng.int(1, a - 1);
    return numericQuestion(`${a} − ${b} = ?`, a - b, numberOptions(rng, tier, a - b, 4), {
      speak: `${a} minus ${b}. What is the answer?`,
      explain: `Yes! ${a} minus ${b} is ${a - b}.`,
    });
  });

// 6. Which number is bigger or smaller, from 10 up to 100.
const compare: Make = (step, tier, rng) =>
  six((i) => {
    const max = 10 * step + 10;
    const a = rng.int(1, max);
    let b = rng.int(1, max);
    if (b === a) b = a + 1;
    const bigger = i % 2 === 0;
    const answer = bigger ? Math.max(a, b) : Math.min(a, b);
    return numericQuestion(`Which number is ${bigger ? 'bigger' : 'smaller'}?`, answer, rng.shuffle([a, b]).map((n): Option => ({ label: String(n) })), {
      speak: `Which number is ${bigger ? 'bigger' : 'smaller'}, ${a} or ${b}?`,
      explain: `Yes! ${answer} is ${bigger ? 'bigger' : 'smaller'}.`,
    });
  });

// 7. Skip counting: what comes next? 2s, 5s, 10s, then 3s, 4s.
const SKIPS = [2, 2, 5, 5, 10, 10, 3, 4, 3, 4];
const skip: Make = (step, tier, rng) =>
  six(() => {
    const by = SKIPS[step - 1];
    const start = by * rng.int(0, 8);
    const seq = [start + by, start + 2 * by, start + 3 * by];
    const next = start + 4 * by;
    return numericQuestion(`${seq.join(', ')}, ___`, next, numberOptions(rng, tier, next, by), {
      speak: `Count by ${by}s. ${seq.join(', ')}, what comes next?`,
      explain: `Yes! Counting by ${by}s, next is ${next}.`,
    });
  });

// 8. Tens and ones.
const place: Make = (step, tier, rng) =>
  six((i) => {
    const hi = step <= 4 ? 39 : step <= 8 ? 79 : 99;
    const n = rng.int(10, hi);
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (i % 2 === 0) {
      return numericQuestion(`${n} has how many tens?`, tens, numberOptions(rng, tier, tens, 2), { speak: `${n}. How many tens?`, explain: `Yes! ${n} has ${tens} tens and ${ones} ones.` });
    }
    return numericQuestion(`${tens} tens and ${ones} ones make…`, n, numberOptions(rng, tier, n, 10), { speak: `${tens} tens and ${ones} ones. What number is that?`, explain: `Yes! ${tens} tens and ${ones} ones is ${n}.` });
  });

// 9. Groups: 2, 3, 4, 5, 10 times.
const TIMES = [2, 2, 3, 3, 4, 5, 5, 10, 4, 5];
const times: Make = (step, tier, rng) =>
  six(() => {
    const by = TIMES[step - 1];
    const groups = rng.int(1, 5);
    const total = by * groups;
    const emoji = rng.pick(OBJECTS);
    return numericQuestion(`${groups} groups of ${by}. How many in all?`, total, numberOptions(rng, tier, total, by), {
      promptEmoji: Array.from({ length: Math.min(groups, 5) }, () => emoji.repeat(Math.min(by, 5))).join('  '),
      speak: `${groups} groups of ${by}. How many in all?`,
      explain: `Yes! ${groups} times ${by} is ${total}.`,
    });
  });

// 10. The clock and pesos.
const CLOCKS = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
const HALF = ['🕧', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦'];
const timeMoney: Make = (step, tier, rng) =>
  six((i) => {
    if (i % 2 === 0) {
      const h = rng.int(1, 12);
      const half = step >= 5 && rng.int(0, 1) === 1;
      const label = (hour: number, isHalf: boolean) => (isHalf ? `half past ${hour}` : `${hour} o'clock`);
      const correct = label(h, half);
      const pool: Option[] = Array.from({ length: 12 }, (_, k) => ({ label: label(k + 1, half) }));
      return mcq(rng, tier, 'What time is it?', { label: correct }, pool, {
        promptEmoji: (half ? HALF : CLOCKS)[h % 12],
        speak: 'What time is it?',
        explain: `Yes! It is ${correct}.`,
      });
    }
    const coins = [1, 5, 10, 20];
    const a = rng.pick(coins);
    const b = rng.pick(coins);
    const sum = a + b;
    return numericQuestion(`₱${a} + ₱${b} = ?`, sum, numberOptions(rng, tier, sum, 5), {
      promptEmoji: '🪙',
      speak: `${a} pesos plus ${b} pesos. How many pesos?`,
      explain: `Yes! ${a} pesos and ${b} pesos make ${sum} pesos.`,
    });
  });

export function mathLevels(): LevelDef[] {
  const sub = 'math' as const;
  return [
    ...topicLevels({ subject: sub, topicNo: 1, topic: 'Counting', emoji: '🔢', blurb: 'Count the pictures.', make: counting }),
    ...topicLevels({ subject: sub, topicNo: 2, topic: 'Adding to 10', emoji: '➕', blurb: 'Put numbers together.', make: add10 }),
    ...topicLevels({ subject: sub, topicNo: 3, topic: 'Taking away to 10', emoji: '➖', blurb: 'Take numbers away.', make: sub10 }),
    ...topicLevels({ subject: sub, topicNo: 4, topic: 'Bigger adding', emoji: '➕', blurb: 'Add numbers past 10.', make: add20 }),
    ...topicLevels({ subject: sub, topicNo: 5, topic: 'Bigger taking away', emoji: '➖', blurb: 'Take away from bigger numbers.', make: sub20 }),
    ...topicLevels({ subject: sub, topicNo: 6, topic: 'Bigger or smaller', emoji: '⚖️', blurb: 'Which number is bigger or smaller?', make: compare }),
    ...topicLevels({ subject: sub, topicNo: 7, topic: 'Skip counting', emoji: '🦘', blurb: 'Count by 2s, 5s, 10s and more.', make: skip }),
    ...topicLevels({ subject: sub, topicNo: 8, topic: 'Tens and ones', emoji: '🔟', blurb: 'How many tens and ones?', make: place }),
    ...topicLevels({ subject: sub, topicNo: 9, topic: 'Groups', emoji: '✖️', blurb: 'Groups of the same size.', make: times }),
    ...topicLevels({ subject: sub, topicNo: 10, topic: 'Time and pesos', emoji: '🕐', blurb: 'Read the clock and add coins.', make: timeMoney }),
  ];
}
