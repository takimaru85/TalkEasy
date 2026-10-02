/**
 * Talk — the sentence engine. Turns "a starter tile, then a word tile" into ONE natural sentence.
 *
 * It never glues labels together. "I want..." + "Hungry" used to come out as "I want hungry.":
 * the label was appended to the starter. A tile's LABEL is only a name for the button; its PHRASE
 * is the sentence a grown-up (or the defaults) wrote for it — "I'm hungry.", "I need the
 * bathroom.", "I want a snack." — and that phrase already carries the word's grammar: its verb,
 * its article ("a snack", "the toilet", "my blanket") and its casing ("Mom", "water").
 *
 * So the engine reads each tile's phrase against a small table of SENTENCE FRAMES to learn its
 * ROLE (a thing you want, a need, an activity, a state…) and its COMPLEMENT (the words after the
 * verb), then asks the STARTER whether it can say that role. If it can, the starter's template is
 * used ("I want" + thing "water" → "I want water."). If it cannot, the tile's own natural sentence
 * is used instead — "I want..." + Hungry → "I am hungry." — so a child who does not know grammar
 * is never handed a nonsense sentence for tapping two cards.
 *
 * Adding vocabulary needs no code: a tile is classified by the phrase it is given. Adding a
 * starter ("I feel...", "Can I have...") is one entry in STARTERS. Pure (no React Native), so
 * `npm run check:talk` runs every case.
 */

/** What a tile's phrase says about the word, independent of how its button is labelled. */
export type PhraseRole =
  /** Something to have: "I want water.", "I want a snack.", "I want Mom." */
  | 'thing'
  /** Something to do: "I want to play.", "I need to go to the bathroom." */
  | 'activity'
  /** A need: "I need help.", "I need the bathroom.", "I need a break." */
  | 'need'
  /** How I am: "I'm hungry.", "I am tired.", "I'm in pain." */
  | 'state'
  /** A feeling said with feel: "I feel sick." */
  | 'feeling'
  /** A bare word tile a grown-up made with no sentence ("Toy"). */
  | 'word'
  /** A complete sentence that stands on its own: "Yes.", "Please repeat.", "It is too loud." */
  | 'sentence';

export interface TileMeaning {
  role: PhraseRole;
  /** The words after the frame's verb, in the phrase's own casing: "water", "a snack", "Mom". */
  complement: string;
  /** The tile's own natural sentence, punctuated. */
  sentence: string;
}

/** Which template produced a sentence — for the checks and for debugging, never shown. */
export type TemplateId = `${string}_${PhraseRole}` | 'own' | 'state';

export interface GeneratedPhrase {
  /** Shown in the phrase banner. */
  text: string;
  /** Spoken — always the same sentence as the text. */
  speech: string;
  template: TemplateId;
}

// ----------------------------------------------------------------------------- sentence frames
/**
 * How a phrase is read. First match wins, so the more specific frame comes first ("I want to …"
 * before "I want …"). `I'm` and `I am` are the same frame.
 */
const FRAMES: { pattern: RegExp; role: PhraseRole }[] = [
  { pattern: /^I (?:want|would like) (to .+)$/i, role: 'activity' },
  { pattern: /^I (?:want|would like) (.+)$/i, role: 'thing' },
  { pattern: /^I need (to .+)$/i, role: 'activity' },
  { pattern: /^I need (.+)$/i, role: 'need' },
  { pattern: /^I(?:'m|’m| am) (.+)$/i, role: 'state' },
  { pattern: /^I feel (.+)$/i, role: 'feeling' },
];

/**
 * Words that are a whole utterance on their own: a tile labelled just "Yes" is an answer, never a
 * thing to want ("I want yes."). Matched against a bare tile's text, lower-case.
 */
const STANDALONE = new Set([
  'yes', 'no', 'more', 'again', 'please', 'thank you', 'thanks', 'hello', 'hi', 'bye', 'goodbye',
  'stop', 'wait', 'okay', 'ok', 'sorry', 'finished', 'all done', 'help me',
]);

const stripEnd = (s: string) => s.trim().replace(/[.!?…]+$/, '').trim();
const punctuate = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

/**
 * A bare word's casing in a sentence: "Toy" → "toy", but "Mom", "TV" and "I" keep theirs (a name,
 * an acronym). Generated sentences use sentence casing, never the tile's title case.
 */
function sentenceCase(word: string): string {
  if (/^[A-Z]{2,}\b/.test(word) || /^I\b/.test(word)) return word;
  if (PROPER.has(word.split(/\s+/)[0].toLowerCase())) return word;
  return word.charAt(0).toLowerCase() + word.slice(1);
}
/** Family names a child uses as names, so they keep their capital ("I want Mom."). */
const PROPER = new Set(['mom', 'mum', 'mommy', 'mummy', 'mama', 'dad', 'daddy', 'papa', 'grandma', 'grandpa', 'nana', 'granny', 'ate', 'kuya', 'lola', 'lolo']);

/**
 * What a tile means, read from its phrase (and, for a bare word tile, its label). Never throws:
 * anything that matches no frame is a sentence that stands on its own.
 */
export function readTile(label: string, phrase: string): TileMeaning {
  const sentence = punctuate(phrase || label);
  const body = stripEnd(phrase || label);
  // Two sentences ("I'm scared. Stay with me.") are said as written, never re-framed.
  if (/[.!?]\s/.test(body)) return { role: 'sentence', complement: body, sentence };
  for (const f of FRAMES) {
    const m = body.match(f.pattern);
    if (m) return { role: f.role, complement: m[1].trim(), sentence };
  }
  // A tile whose phrase is just its label ("Toy", "Toy.") — a word, not a sentence — unless the
  // word is an utterance on its own ("Yes").
  const bare = body.toLowerCase() === stripEnd(label).toLowerCase() || !/\s/.test(body);
  // A sentence of its own ("I like this", "It is too loud") is never a bare word, even when its label repeats it.
  const hasSubject = /^(?:I|I'm|it|it's|you|we|they|please|can|let's|don't)\b/i.test(body);
  if (bare && !hasSubject && !STANDALONE.has(body.toLowerCase()) && !/[,]/.test(body)) {
    return { role: 'word', complement: sentenceCase(body), sentence };
  }
  return { role: 'sentence', complement: body, sentence };
}

// ----------------------------------------------------------------------------------- starters
interface StarterDef {
  id: string;
  /** Matches the starter's phrase without its "...": "I want". */
  match: RegExp;
  /** How this starter says each role it can say. A role not listed falls back (see generate). */
  says: Partial<Record<PhraseRole, (complement: string) => string>>;
}

/**
 * Every sentence starter TalkEasy understands. A grown-up makes one by giving a tile a phrase
 * ending in "..." ("I feel..."); this table is what it can be followed by.
 */
export const STARTERS: StarterDef[] = [
  {
    id: 'want',
    match: /^I (?:want|would like)$/i,
    says: { thing: (c) => `I want ${c}.`, activity: (c) => `I want ${c}.`, word: (c) => `I want ${c}.` },
  },
  {
    id: 'need',
    match: /^I need$/i,
    says: { need: (c) => `I need ${c}.`, thing: (c) => `I need ${c}.`, activity: (c) => `I need ${c}.`, word: (c) => `I need ${c}.` },
  },
  {
    id: 'feel',
    match: /^I feel$/i,
    // Only a one-word state reads as a feeling: "I feel tired.", not "I feel in pain."
    says: { feeling: (c) => `I feel ${c}.`, state: (c) => (/\s/.test(c) ? `I am ${c}.` : `I feel ${c}.`) },
  },
  { id: 'am', match: /^I(?:'m|’m| am)$/i, says: { state: (c) => `I am ${c}.`, word: (c) => `I am ${c}.` } },
  {
    id: 'like',
    match: /^I like$/i,
    says: { thing: (c) => `I like ${c}.`, activity: (c) => `I like ${c}.`, word: (c) => `I like ${c}.` },
  },
  {
    id: 'dontLike',
    match: /^I (?:don't|don’t|do not) like$/i,
    says: { thing: (c) => `I don't like ${c}.`, activity: (c) => `I don't like ${c}.`, word: (c) => `I don't like ${c}.` },
  },
  { id: 'canIHave', match: /^Can I have$/i, says: { thing: (c) => `Can I have ${c}?`, word: (c) => `Can I have ${c}?` } },
];

/** "I want..." → "I want". */
export function starterHead(starterPhrase: string): string {
  return starterPhrase.trim().replace(/(\.\.\.|…)$/, '').trim();
}

/** Whether a phrase is a sentence starter (it ends with "..."). */
export function isStarterPhrase(phrase: string): boolean {
  return /(\.\.\.|…)$/.test(phrase.trim());
}

/** What a word tile says on its own, when the starter cannot say it. */
function ownSentence(t: TileMeaning): GeneratedPhrase {
  // A state is said in full ("I am hungry."), the form a starter-built sentence takes.
  if (t.role === 'state') return out(`I am ${t.complement}.`, 'state');
  return out(t.sentence, 'own');
}

function out(text: string, template: TemplateId): GeneratedPhrase {
  const s = text.charAt(0).toUpperCase() + text.slice(1);
  return { text: s, speech: s, template };
}

/**
 * The sentence for "starter, then this tile".
 *
 *   generatePhrase({ starter: 'I want...', label: 'Water',  phrase: 'I want water.' })        → "I want water."
 *   generatePhrase({ starter: 'I want...', label: 'Hungry', phrase: "I'm hungry." })          → "I am hungry."
 *   generatePhrase({ starter: 'I want...', label: 'Bathroom', phrase: 'I need the bathroom.' }) → "I need the bathroom."
 *
 * A starter that is not in STARTERS (a grown-up's own "Can you give me...") still never produces
 * nonsense: it is followed by a thing or a bare word, and anything else says its own sentence.
 */
export function generatePhrase({ starter, label, phrase }: { starter: string; label: string; phrase: string }): GeneratedPhrase {
  const head = starterHead(starter);
  const tile = readTile(label, phrase);
  const def = STARTERS.find((s) => s.match.test(head));
  if (def) {
    const say = def.says[tile.role];
    // A role the starter cannot say keeps the tile's own verb: "I want..." + Bathroom is "I need
    // the bathroom." (the tile's author chose need), + Hungry is "I am hungry."
    if (say) return out(say(tile.complement), `${def.id}_${tile.role}`);
    return ownSentence(tile);
  }
  if (tile.role === 'thing' || tile.role === 'word') return out(`${head} ${tile.complement}.`, `custom_${tile.role}`);
  return ownSentence(tile);
}
