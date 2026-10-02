import type { AssignmentType, ParsedAssignment } from './types';

/**
 * Reads extracted text and reports what KIND of assignment it looks like.
 *
 * THE PARSER NEVER CHANGES THE TEXT. It is handed a copy and returns a separate description; the
 * original stays exactly as the engine read it (see types.ts). A parent must always be able to get
 * back to what was actually on the page.
 *
 * IT ALSO NEVER ANSWERS THE HOMEWORK. It will say "this looks like a spelling list and here are the
 * words", because reading a list back to a child is useful and safe. It will not solve the sums, fill
 * the blanks, or decide what the right answer is — an app guessing at a child's schoolwork and
 * getting it wrong teaches them something false and costs their teacher the chance to see what they
 * actually knew.
 *
 * `canMakeActivity` is a HIGHER BAR than `type`. Labelling a scan "looks like vocabulary" costs
 * nothing if it is wrong; building an activity from a misread worksheet wastes a child's time, so
 * the app only offers one when the structure is unmistakable.
 */

/** A line that is just a number, a bullet or a stray mark — not content. */
function isNoise(line: string): boolean {
  return line.length === 0 || /^[\s\d.)\-•*_]+$/.test(line);
}

/** "1. Dog" / "2) Cat" / "- Bird" / "• Fish" → the word itself. */
function stripMarker(line: string): string {
  return line.replace(/^\s*(?:\d+\s*[.)\]]|[-•*])\s*/, '').trim();
}

function looksNumbered(line: string): boolean {
  return /^\s*(?:\d+\s*[.)\]]|[-•*])\s+\S/.test(line);
}

/** "2 + 3 = ___", "10 - 4 =", "5 x 2 = ?" */
function looksLikeSum(line: string): boolean {
  return /\d+\s*[+\-x×*/÷]\s*\d+\s*=/.test(line);
}

const INSTRUCTION_HINTS = [
  'write', 'read', 'spell', 'match', 'circle', 'draw', 'answer', 'complete', 'fill',
  'name the', 'choose', 'underline', 'copy', 'solve', 'count',
];

export function parseAssignment(raw: string): ParsedAssignment {
  const text = raw.trim();
  const unknown = (): ParsedAssignment => ({
    type: 'unknown',
    title: firstMeaningfulLine(text) || 'Scanned assignment',
    instructions: '',
    items: [],
    content: text,
    canMakeActivity: false,
  });

  if (text.length === 0) return unknown();

  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const meaningful = lines.filter((l) => !isNoise(l));
  if (meaningful.length === 0) return unknown();

  // The instruction is the first line that reads like one ("Write the names of…").
  const instrIndex = meaningful.findIndex((l) => {
    const lower = l.toLowerCase();
    return INSTRUCTION_HINTS.some((h) => lower.startsWith(h) || lower.includes(` ${h} `));
  });
  const instructions = instrIndex >= 0 ? meaningful[instrIndex] : '';
  const body = meaningful.filter((_, i) => i !== instrIndex);

  const listItems = body.filter(looksNumbered).map(stripMarker).filter((l) => l.length > 0);
  const sums = body.filter(looksLikeSum);
  const lower = instructions.toLowerCase();

  // ---- Basic maths -------------------------------------------------------------------------------
  // Recognised by the sums themselves, not by the instruction: a worksheet of sums often has no
  // words on it at all.
  if (sums.length >= 2) {
    return {
      type: 'math',
      title: instructions || 'Maths practice',
      instructions,
      items: sums,
      // The app will READ these out. It does not work them out.
      canMakeActivity: sums.length >= 3,
      content: text,
    };
  }

  // ---- Spelling ----------------------------------------------------------------------------------
  if (/spell/.test(lower) && listItems.length >= 2) {
    return {
      type: 'spelling',
      title: instructions || 'Spelling words',
      instructions,
      items: listItems,
      canMakeActivity: listItems.length >= 3 && listItems.every((w) => w.split(/\s+/).length === 1),
      content: text,
    };
  }

  // ---- Vocabulary --------------------------------------------------------------------------------
  // A list of short items under an instruction: the "write the names of these animals" shape.
  if (listItems.length >= 2) {
    const shortItems = listItems.filter((w) => w.split(/\s+/).length <= 3);
    const isWordList = shortItems.length === listItems.length;
    return {
      type: isWordList ? 'vocabulary' : 'reading',
      title: instructions || firstMeaningfulLine(text) || 'Scanned assignment',
      instructions,
      items: isWordList ? listItems : [],
      content: text,
      canMakeActivity: isWordList && listItems.length >= 3,
    };
  }

  // ---- Reading -----------------------------------------------------------------------------------
  // Prose: sentences rather than a list. Worth offering Read Aloud, never an activity, because the
  // app cannot tell comprehension questions from the passage they are about.
  const words = text.split(/\s+/).length;
  if (words >= 12) {
    return {
      type: 'reading',
      title: instructions || firstMeaningfulLine(text) || 'Reading',
      instructions,
      items: [],
      content: text,
      canMakeActivity: false,
    };
  }

  return unknown();
}

function firstMeaningfulLine(text: string): string {
  const line = text.split(/\r?\n/).map((l) => l.trim()).find((l) => !isNoise(l)) ?? '';
  // A title is a label in a list, not the whole worksheet.
  return line.length > 60 ? `${line.slice(0, 57).trimEnd()}…` : line;
}

/** For a grown-up: what the app thinks it found. Plain words, and honest when it does not know. */
export function describeType(type: AssignmentType): string {
  switch (type) {
    case 'reading':
      return 'Looks like something to read';
    case 'vocabulary':
      return 'Looks like a word list';
    case 'spelling':
      return 'Looks like spelling words';
    case 'math':
      return 'Looks like maths practice';
    case 'unknown':
      return 'Saved as text';
  }
}
