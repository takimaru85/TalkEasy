import type { Difficulty } from '@/types/models';
import { QUESTIONS_PER_SESSION as N, emojiGroup, mcq, numberOptions, numericQuestion } from '../engine';
import type { LearningActivity, LearningSubject, Option } from '../types';

const COUNT_EMOJI = ['🍎', '⭐', '🐟', '🎈', '🌸', '🚗', '🐣', '🍪', '⚽', '🦋'];

const RANGE: Record<Difficulty, { max: number; addMax: number; subMax: number; mulMax: number }> = {
  easy: { max: 10, addMax: 10, subMax: 10, mulMax: 3 },
  medium: { max: 50, addMax: 20, subMax: 20, mulMax: 5 },
  hard: { max: 100, addMax: 100, subMax: 100, mulMax: 10 },
};

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

const numberRecognition: LearningActivity = {
  key: 'math.number_recognition',
  subjectKey: 'math',
  title: 'Find the number',
  emoji: '🔢',
  description: 'Hear a number, tap the matching numeral.',
  generate: (d, rng) =>
    Array.from({ length: N }, () => {
      const max = d === 'easy' ? 10 : d === 'medium' ? 20 : 100;
      const n = rng.int(0, max);
      const word = n <= 20 ? NUMBER_WORDS[n] : String(n);
      return numericQuestion(`Which number is ${word}?`, n, numberOptions(rng, d, n, d === 'hard' ? 10 : 3), {
        speak: `Which number is ${word}?`,
        explain: `Yes! This is ${word}.`,
      });
    }),
};

const counting: LearningActivity = {
  key: 'math.counting',
  subjectKey: 'math',
  title: 'Counting',
  emoji: '🍎',
  description: 'Count the pictures and tap how many.',
  generate: (d, rng) =>
    Array.from({ length: N }, () => {
      const n = rng.int(1, d === 'easy' ? 5 : d === 'medium' ? 10 : 15);
      const emoji = rng.pick(COUNT_EMOJI);
      return numericQuestion('How many?', n, numberOptions(rng, d, n, 2), {
        promptEmoji: emojiGroup(emoji, n),
        speak: 'How many do you see? Count them.',
        explain: `Yes! There are ${n}.`,
      });
    }),
};

const addition: LearningActivity = {
  key: 'math.addition',
  subjectKey: 'math',
  title: 'Addition',
  emoji: '➕',
  description: 'Add two numbers.',
  generate: (d, rng) =>
    Array.from({ length: N }, () => {
      const max = RANGE[d].addMax;
      const a = rng.int(0, max);
      const b = rng.int(0, max - a);
      const sum = a + b;
      const pic = d === 'easy' && sum <= 10 ? `${emojiGroup('🟦', a)}\n➕\n${emojiGroup('🟨', b)}` : undefined;
      return numericQuestion(`${a} + ${b} = ?`, sum, numberOptions(rng, d, sum, d === 'hard' ? 10 : 3), {
        promptEmoji: pic,
        speak: `${a} plus ${b} equals what?`,
        explain: `Yes! ${a} plus ${b} is ${sum}.`,
      });
    }),
};

const subtraction: LearningActivity = {
  key: 'math.subtraction',
  subjectKey: 'math',
  title: 'Subtraction',
  emoji: '➖',
  description: 'Take away and find what is left.',
  generate: (d, rng) =>
    Array.from({ length: N }, () => {
      const max = RANGE[d].subMax;
      const a = rng.int(1, max);
      const b = rng.int(0, a);
      const diff = a - b;
      const pic = d === 'easy' && a <= 10 ? emojiGroup('🍪', a) : undefined;
      return numericQuestion(`${a} − ${b} = ?`, diff, numberOptions(rng, d, diff, d === 'hard' ? 10 : 3), {
        promptEmoji: pic,
        speak: `${a} minus ${b} equals what?`,
        explain: `Yes! ${a} minus ${b} is ${diff}.`,
      });
    }),
};

const multiplication: LearningActivity = {
  key: 'math.multiplication',
  subjectKey: 'math',
  title: 'Multiplication',
  emoji: '✖️',
  description: 'Groups of the same size (2s, 3s, 5s, 10s).',
  generate: (d, rng) =>
    Array.from({ length: N }, () => {
      const tables = d === 'easy' ? [2, 5, 10] : d === 'medium' ? [2, 3, 4, 5, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10];
      const a = rng.pick(tables);
      const b = rng.int(1, RANGE[d].mulMax);
      const prod = a * b;
      const pic = d !== 'hard' && a * b <= 20 ? Array.from({ length: b }, () => '🍬'.repeat(a)).join('\n') : undefined;
      return numericQuestion(`${a} × ${b} = ?`, prod, numberOptions(rng, d, prod, a), {
        promptEmoji: pic,
        speak: `${a} times ${b} equals what?`,
        explain: `Yes! ${a} times ${b} is ${prod}.`,
      });
    }),
};

const comparing: LearningActivity = {
  key: 'math.comparing',
  subjectKey: 'math',
  title: 'Bigger or smaller',
  emoji: '⚖️',
  description: 'Which number is bigger? Which is smaller?',
  generate: (d, rng) =>
    Array.from({ length: N }, () => {
      const max = RANGE[d].max;
      let a = rng.int(0, max);
      let b = rng.int(0, max);
      if (a === b) b = (b + 1) % (max + 1);
      const wantBigger = rng.next() < 0.5;
      const answer = wantBigger ? Math.max(a, b) : Math.min(a, b);
      const options: Option[] = rng.shuffle([{ label: String(a) }, { label: String(b) }]);
      if (d === 'hard') {
        // add one more that is clearly not the answer
        const c = wantBigger ? Math.min(a, b) - 1 : Math.max(a, b) + 1;
        if (c >= 0 && c !== a && c !== b) options.push({ label: String(c) });
      }
      const shuffled = rng.shuffle(options);
      return {
        prompt: `Which is ${wantBigger ? 'BIGGER' : 'SMALLER'}?`,
        speak: `Which number is ${wantBigger ? 'bigger' : 'smaller'}? ${a}, or ${b}?`,
        options: shuffled,
        answer: shuffled.findIndex((o) => o.label === String(answer)),
        explain: `Yes! ${answer} is ${wantBigger ? 'bigger' : 'smaller'}.`,
      };
    }),
};

const SHAPES: Option[] = [
  { label: 'Circle', emoji: '🔵' },
  { label: 'Square', emoji: '🟥' },
  { label: 'Triangle', emoji: '🔺' },
  { label: 'Star', emoji: '⭐' },
  { label: 'Heart', emoji: '❤️' },
  { label: 'Diamond', emoji: '🔶' },
];

const shapes: LearningActivity = {
  key: 'math.shapes',
  subjectKey: 'math',
  title: 'Shapes',
  emoji: '🔺',
  description: 'Name the shape.',
  generate: (d, rng) =>
    rng.sample(SHAPES, N).map((shape) =>
      rng.next() < 0.5
        ? mcq(rng, d, 'What shape is this?', { label: shape.label }, SHAPES.map((s) => ({ label: s.label })), {
            promptEmoji: shape.emoji,
            explain: `Yes! It is a ${shape.label.toLowerCase()}.`,
          })
        : mcq(rng, d, `Find the ${shape.label.toLowerCase()}.`, { label: shape.label, emoji: shape.emoji, speak: shape.label }, SHAPES, {
            speak: `Tap the ${shape.label.toLowerCase()}.`,
            explain: `Yes! That is the ${shape.label.toLowerCase()}.`,
          }),
    ),
};

const CLOCKS: Record<number, string> = { 1: '🕐', 2: '🕑', 3: '🕒', 4: '🕓', 5: '🕔', 6: '🕕', 7: '🕖', 8: '🕗', 9: '🕘', 10: '🕙', 11: '🕚', 12: '🕛' };
const HALF_CLOCKS: Record<number, string> = { 1: '🕜', 2: '🕝', 3: '🕞', 4: '🕟', 5: '🕠', 6: '🕡', 7: '🕢', 8: '🕣', 9: '🕤', 10: '🕥', 11: '🕦', 12: '🕧' };

const time: LearningActivity = {
  key: 'math.time',
  subjectKey: 'math',
  title: 'Telling time',
  emoji: '🕒',
  description: "Read the clock: o'clock and half past.",
  generate: (d, rng) =>
    Array.from({ length: N }, () => {
      const hour = rng.int(1, 12);
      const half = d !== 'easy' && rng.next() < 0.5;
      const label = half ? `${hour}:30` : `${hour}:00`;
      const spoken = half ? `half past ${hour}` : `${hour} o'clock`;
      const pool: Option[] = [];
      for (let h = 1; h <= 12; h++) {
        pool.push({ label: `${h}:00`, speak: `${h} o'clock` });
        if (d !== 'easy') pool.push({ label: `${h}:30`, speak: `half past ${h}` });
      }
      return mcq(rng, d, 'What time is it?', { label, speak: spoken }, pool, {
        promptEmoji: half ? HALF_CLOCKS[hour] : CLOCKS[hour],
        explain: `Yes! It is ${spoken}.`,
      });
    }),
};

const COINS = [
  { value: 1, emoji: '🪙', name: '1 peso' },
  { value: 5, emoji: '🪙', name: '5 pesos' },
  { value: 10, emoji: '🪙', name: '10 pesos' },
  { value: 20, emoji: '💵', name: '20 pesos' },
];

const money: LearningActivity = {
  key: 'math.money',
  subjectKey: 'math',
  title: 'Money (pesos)',
  emoji: '💰',
  description: 'Add up Philippine coins and bills.',
  generate: (d, rng) =>
    Array.from({ length: N }, () => {
      const pieces = d === 'easy' ? 2 : d === 'medium' ? 3 : 4;
      const allowed = d === 'easy' ? COINS.slice(0, 2) : d === 'medium' ? COINS.slice(0, 3) : COINS;
      const chosen = Array.from({ length: pieces }, () => rng.pick(allowed));
      const total = chosen.reduce((s, c) => s + c.value, 0);
      const line = chosen.map((c) => `₱${c.value}`).join(' + ');
      const opts = numberOptions(rng, d, total, 5).map((o) => ({ label: `₱${o.label}` }));
      return {
        prompt: `${line} = ?`,
        promptEmoji: chosen.map((c) => c.emoji).join(' '),
        speak: `${chosen.map((c) => c.name).join(', plus ')}. How much altogether?`,
        options: opts,
        answer: opts.findIndex((o) => o.label === `₱${total}`),
        explain: `Yes! That is ${total} pesos.`,
      };
    }),
};

export const MATH: LearningSubject = {
  key: 'math',
  name: 'Mathematics',
  emoji: '🔢',
  color: '#C4F2C8',
  activities: [numberRecognition, counting, addition, subtraction, multiplication, comparing, shapes, time, money],
};

