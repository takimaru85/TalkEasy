import type { Guide } from '@/components/adaptive/HandwritingCanvas';

/**
 * Handwriting / tracing practice content. Seven levels from big strokes to short answers.
 * Nothing here is graded — the purpose is motor practice and confidence.
 */
export interface WritingItem {
  /** What the child is asked to do (spoken aloud). */
  prompt: string;
  /** Big label shown above the canvas. */
  display: string;
  guide: Guide;
  /** For "copy" levels the model is shown above the canvas, not traced. */
  model?: string;
}

export interface WritingLevel {
  level: number;
  title: string;
  emoji: string;
  description: string;
  items: WritingItem[];
}

const letters = (s: string) => s.split('').map((ch) => ({ prompt: `Trace the letter ${ch}`, display: ch, guide: { kind: 'text', text: ch } as Guide }));
const numbers = (s: string) => s.split('').map((ch) => ({ prompt: `Trace the number ${ch}`, display: ch, guide: { kind: 'text', text: ch } as Guide }));
const traceWords = (w: string[]) => w.map((word) => ({ prompt: `Trace the word ${word}`, display: word, guide: { kind: 'text', text: word } as Guide }));
const copyWords = (w: string[]) => w.map((word) => ({ prompt: `Copy the word ${word}`, display: word, model: word, guide: { kind: 'none' } as Guide }));

export const WRITING_LEVELS: WritingLevel[] = [
  {
    level: 1, title: 'Trace lines', emoji: '〰️', description: 'Big strokes: across, down, zigzag, wave.',
    items: [
      { prompt: 'Trace the line across', display: '—', guide: { kind: 'line', variant: 'horizontal' } },
      { prompt: 'Trace the line down', display: '|', guide: { kind: 'line', variant: 'vertical' } },
      { prompt: 'Trace the slanted line', display: '/', guide: { kind: 'line', variant: 'diagonal' } },
      { prompt: 'Trace the zigzag', display: 'ᐱᐱ', guide: { kind: 'line', variant: 'zigzag' } },
      { prompt: 'Trace the wave', display: '〰️', guide: { kind: 'line', variant: 'wave' } },
    ],
  },
  {
    level: 2, title: 'Trace shapes', emoji: '🔺', description: 'Circle, square, triangle.',
    items: [
      { prompt: 'Trace the circle', display: '○', guide: { kind: 'shape', variant: 'circle' } },
      { prompt: 'Trace the square', display: '□', guide: { kind: 'shape', variant: 'square' } },
      { prompt: 'Trace the triangle', display: '△', guide: { kind: 'shape', variant: 'triangle' } },
    ],
  },
  { level: 3, title: 'Trace letters', emoji: '🔤', description: 'Big letters, then small letters.', items: [...letters('AOLTC'), ...letters('aoltc'), ...letters('BEMSD')] },
  { level: 4, title: 'Trace numbers', emoji: '🔢', description: 'Numbers 0 to 9.', items: numbers('0123456789') },
  { level: 5, title: 'Trace words', emoji: '📝', description: 'Short words with a guide.', items: traceWords(['cat', 'dog', 'sun', 'mom', 'dad', 'me']) },
  { level: 6, title: 'Copy words', emoji: '✏️', description: 'Look at the word and write it.', items: copyWords(['cat', 'sun', 'red', 'big', 'aso', 'pusa']) },
  {
    level: 7, title: 'Write answers', emoji: '💬', description: 'Short answers, any way you like.',
    items: [
      { prompt: 'Write your name', display: 'My name', guide: { kind: 'none' } },
      { prompt: 'Write how old you are', display: 'My age', guide: { kind: 'none' } },
      { prompt: 'Write one thing you like', display: 'I like…', guide: { kind: 'none' } },
      { prompt: 'Write 2 plus 2', display: '2 + 2 =', guide: { kind: 'none' } },
    ],
  },
];

export function getWritingLevel(level: number): WritingLevel | undefined {
  return WRITING_LEVELS.find((l) => l.level === level);
}
