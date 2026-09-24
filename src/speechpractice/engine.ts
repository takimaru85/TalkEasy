import { SOUND_EXERCISES, getSoundExercise } from '@/soundpractice/content';
import {
  CLAP_WORDS,
  COLOUR_THINGS,
  DIRECTION_VERBS,
  IMITATION,
  PHRASES,
  RHYMES,
  ROLE_PLAY,
  SENTENCE_FRAMES,
  SOCIAL,
  SOCIAL_CATEGORIES,
  STORIES,
  TURN_GAMES,
  VOICE,
  WH_QUESTIONS,
} from './content';
import { VOCAB_CATEGORIES, VOCABULARY, WORD_PRACTICE_CATEGORIES, thingVocabulary, vocabInCategory, type VocabItem } from './vocabulary';
import { SYLLABLE_CONSONANTS, modelKey, syllablesFor } from './pronunciation';
import type {
  ActivityCategory,
  ActivityId,
  BuildExercise,
  ChooseExercise,
  Exercise,
  MyWord,
  SayExercise,
  SentenceFrame,
  SpeechItem,
} from './types';

/**
 * Turns Speech Practice content into exercises. Pure functions, no React and no I/O, so the
 * whole thing is checked by `npm run check:speech`.
 *
 * Every activity maps onto one of six exercise kinds (see types.ts). Adding an activity is a
 * case here plus a row in activities.ts; adding content is data only.
 */

export const MY_WORDS_KEY = 'my';
const MY_WORDS_CATEGORY: ActivityCategory = { key: MY_WORDS_KEY, name: 'My Words', picture: '⭐' };

/** Rounds per mixed activity (Listening, Directions…). Short on purpose — no fatigue, no rush. */
const ROUNDS = 8;

export interface BuildOptions {
  /** The group the child picked, for activities that have groups. */
  category?: string;
  /** The parent's own words (Talk cards marked for practice). */
  myWords?: MyWord[];
  /** Injected for tests; defaults to Math.random. */
  random?: () => number;
}

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------

/** A small seeded generator so checks are repeatable. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `count` items from `pool` that are not `exclude`, never repeating a picture. */
function distractors<T extends SpeechItem>(pool: T[], exclude: SpeechItem[], count: number, random: () => number): T[] {
  const taken = new Set(exclude.map((e) => e.picture ?? e.text));
  const out: T[] = [];
  for (const item of shuffle(pool, random)) {
    const key = item.picture ?? item.text;
    if (taken.has(key)) continue;
    taken.add(key);
    out.push(item);
    if (out.length === count) break;
  }
  return out;
}


/** "a" / "an" for a spoken noun. */
function indefinite(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

/** "I want" + apple → "I want an apple."; + milk → "I want milk."; Give me + cup → "Give me the cup." */
export function composeSentence(frame: SentenceFrame, word: SpeechItem & { mass?: boolean; name?: boolean }): string {
  const noun = word.name ? word.text : word.text.toLowerCase();
  let article = '';
  if (!word.name && frame.article !== 'none') {
    if (frame.article === 'the') article = 'the ';
    else if (!word.mass) article = `${indefinite(noun)} `;
  }
  return `${frame.starter} ${article}${noun}.`;
}

function myWordItems(myWords: MyWord[] = []): (SpeechItem & { name: boolean; phrase: string })[] {
  return myWords.map((w) => ({
    id: `my-${w.id}`,
    text: w.label,
    picture: w.icon,
    imageUri: w.imageUri,
    // A parent's word is usually a name ("Grandma") — no article in a sentence.
    name: true,
    phrase: w.phrase,
  }));
}

/** A syllable as a practice item: shown as "BA", modelled only by its recording. */
function syllableItem(id: string, picture?: string): SpeechItem {
  return { id: `syl-${id}`, text: id.toUpperCase(), picture, modelKey: modelKey('syllable', id), strict: true };
}

/** Built-in words can carry a recorded model; a parent's own words use the device voice. */
function withWordModel(w: SpeechItem): SpeechItem {
  return w.id.startsWith('v-') ? { ...w, modelKey: modelKey('word', w.id) } : w;
}

function say(id: string, item: SpeechItem, extra: Partial<SayExercise> = {}): SayExercise {
  return { kind: 'say', id, item, mode: 'speak', ...extra };
}

function soundItem(soundId: string): SpeechItem {
  const ex = getSoundExercise(soundId);
  // A recorded model (bundled or parent-made) wins; until then the sound's cue is spoken.
  return { id: `snd-${soundId}`, text: ex?.sound ?? soundId.toUpperCase(), picture: ex?.emoji, soundId, modelKey: modelKey('sound', soundId) };
}

const SAME: SpeechItem = { id: 'same', text: 'Same', picture: '🟰', labelKey: 'spSame' };
const DIFFERENT: SpeechItem = { id: 'different', text: 'Different', picture: '↔️', labelKey: 'spDifferent' };

// ---------------------------------------------------------------------------------------------
// Groups (the picker shown before some activities)
// ---------------------------------------------------------------------------------------------

/** The groups a child picks from first, or null when the activity starts straight away. */
export function categoriesFor(activityId: ActivityId, myWords: MyWord[] = []): ActivityCategory[] | null {
  const mine = myWords.length > 0 ? [MY_WORDS_CATEGORY] : [];
  switch (activityId) {
    case 'words':
      return [...mine, ...VOCAB_CATEGORIES.filter((c) => WORD_PRACTICE_CATEGORIES.includes(c.key))];
    case 'vocabulary':
      return [...mine, ...VOCAB_CATEGORIES];
    case 'syllables':
      // The syllable library's consonant rows (pronunciation.ts), in teaching order.
      return SYLLABLE_CONSONANTS.map((c) => ({ key: c, name: c.toUpperCase(), picture: getSoundExercise(c)?.emoji ?? '🔤' }));
    case 'social':
      return SOCIAL_CATEGORIES;
    case 'stories':
      return STORIES.map((s) => ({ key: s.id, name: s.title, picture: s.picture }));
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Exercise builders
// ---------------------------------------------------------------------------------------------

function wordsFor(category: string | undefined, myWords: MyWord[] | undefined): SpeechItem[] {
  if (category === MY_WORDS_KEY) return myWordItems(myWords);
  return category ? vocabInCategory(category) : [];
}

function listening(random: () => number): ChooseExercise[] {
  const pool = thingVocabulary();
  return shuffle(pool, random).slice(0, ROUNDS).map((target, i) => ({
    kind: 'choose',
    id: `listen-${i}-${target.id}`,
    promptKey: 'spWhatDidYouHear',
    listen: [target],
    choices: shuffle([target, ...distractors(pool, [target], 2, random)], random),
    answerIds: [target.id],
    display: 'picture',
  }));
}

function matching(random: () => number): ChooseExercise[] {
  const sounds = SOUND_EXERCISES.map((s) => soundItem(s.id));
  const out: ChooseExercise[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const target = sounds[Math.floor(random() * sounds.length)];
    if (i % 2 === 0) {
      out.push({
        kind: 'choose',
        id: `match-which-${i}-${target.id}`,
        promptKey: 'spWhichSound',
        listen: [target],
        choices: shuffle([target, ...distractors(sounds, [target], 2, random)], random),
        answerIds: [target.id],
        display: 'text',
      });
    } else {
      const same = random() < 0.5;
      const other = same ? target : distractors(sounds, [target], 1, random)[0];
      out.push({
        kind: 'choose',
        id: `match-same-${i}-${target.id}-${other.id}`,
        promptKey: 'spSameOrDifferent',
        // Heard only — showing the letters would turn listening into reading.
        listen: [target, other],
        choices: [SAME, DIFFERENT],
        answerIds: [same ? SAME.id : DIFFERENT.id],
        display: 'picture',
      });
    }
  }
  return out;
}

function pictureNaming(random: () => number, myWords?: MyWord[]): ChooseExercise[] {
  const pool = thingVocabulary();
  // A parent's photo ("Grandma") is the most meaningful picture there is — they go first.
  const mine = myWordItems(myWords).filter((w) => w.imageUri || w.picture);
  const targets = [...mine.slice(0, 3), ...shuffle(pool, random)].slice(0, ROUNDS);
  return targets.map((target, i) => ({
    kind: 'choose',
    id: `name-${i}-${target.id}`,
    promptKey: 'spWhatIsThis',
    listen: [],
    show: [target],
    choices: shuffle([target, ...distractors(pool, [target], 2, random)], random),
    answerIds: [target.id],
    display: 'text',
    allowSay: true,
  }));
}

function directions(random: () => number): ChooseExercise[] {
  const pool = thingVocabulary();
  const out: ChooseExercise[] = shuffle(pool, random).slice(0, ROUNDS - 2).map((target, i) => {
    const prompt = `${DIRECTION_VERBS[i % DIRECTION_VERBS.length]} ${target.text.toLowerCase()}.`;
    return {
      kind: 'choose',
      id: `dir-${i}-${target.id}`,
      prompt,
      listen: [{ id: `say-${target.id}`, text: prompt }],
      choices: shuffle([target, ...distractors(pool, [target], 3, random)], random),
      answerIds: [target.id],
      display: 'picture',
    };
  });
  // Two colour directions: the same object in another colour is the near choice.
  for (let i = 0; i < 2; i++) {
    const target = COLOUR_THINGS[Math.floor(random() * COLOUR_THINGS.length)];
    const prompt = `Touch the ${target.text}.`;
    out.push({
      kind: 'choose',
      id: `dir-col-${i}-${target.id}`,
      prompt,
      listen: [{ id: `say-${target.id}`, text: prompt }],
      choices: shuffle([target, ...distractors(COLOUR_THINGS, [target], 2, random)], random),
      answerIds: [target.id],
      display: 'picture',
    });
  }
  return out;
}

/**
 * A two-step direction ("Touch the dog, then tap the ball"). Ready for a later version — the
 * choose exercise already supports ordered answers — and deliberately not in the first rounds.
 */
export function twoStepDirection(first: VocabItem, second: VocabItem, others: VocabItem[], random: () => number): ChooseExercise {
  const prompt = `Touch the ${first.text.toLowerCase()}, then tap the ${second.text.toLowerCase()}.`;
  return {
    kind: 'choose',
    id: `dir2-${first.id}-${second.id}`,
    prompt,
    listen: [{ id: `say-${first.id}-${second.id}`, text: prompt }],
    choices: shuffle([first, second, ...others], random),
    answerIds: [first.id, second.id],
    ordered: true,
    display: 'picture',
  };
}

function memory(random: () => number): ChooseExercise[] {
  const pool = thingVocabulary();
  return [2, 2, 3, 3, 4, 4].map((count, i) => {
    const shown = distractors(pool, [], count, random);
    return {
      kind: 'choose',
      id: `mem-${i}-${shown.map((s) => s.id).join('-')}`,
      promptKey: 'spWhatDidYouSee',
      listen: [],
      preview: shown,
      choices: shuffle([...shown, ...distractors(pool, shown, 2, random)], random),
      answerIds: shown.map((s) => s.id),
      display: 'picture',
    };
  });
}

function sentences(random: () => number, myWords?: MyWord[]): BuildExercise[] {
  const mine = myWordItems(myWords);
  return SENTENCE_FRAMES.map((frame) => {
    const pool = VOCABULARY.filter((v) => frame.categories.includes(v.category));
    const personal = frame.id === 'want' || frame.id === 'see' || frame.id === 'give' ? shuffle(mine, random).slice(0, 1) : [];
    const cards = [...personal, ...distractors(pool, personal, 4 - personal.length, random)];
    return { kind: 'build', id: `build-${frame.id}`, frame, cards: shuffle(cards, random) };
  });
}

function questions(): ChooseExercise[] {
  return WH_QUESTIONS.map((q) => ({
    kind: 'choose',
    id: q.id,
    prompt: q.question,
    listen: [{ id: `say-${q.id}`, text: q.question }],
    show: q.scene.map((p, i) => ({ id: `${q.id}-scene-${i}`, text: '', picture: p })),
    choices: q.choices,
    answerIds: [q.answerId],
    display: 'picture',
  }));
}

function rhythm(random: () => number): Exercise[] {
  const rhymes: ChooseExercise[] = shuffle(RHYMES, random).map((r) => ({
    kind: 'choose',
    id: r.id,
    prompt: `What rhymes with ${r.word.text.toLowerCase()}?`,
    listen: [{ id: `say-${r.id}`, text: `What rhymes with ${r.word.text.toLowerCase()}?` }],
    show: [r.word],
    choices: shuffle([r.rhyme, ...r.others], random),
    answerIds: [r.rhyme.id],
    display: 'picture',
  }));
  const claps = CLAP_WORDS.map((w) => ({ kind: 'clap' as const, id: w.item.id, item: w.item, beats: w.beats }));
  // Alternate: rhyme, clap, rhyme, clap…
  const out: Exercise[] = [];
  for (let i = 0; i < Math.max(rhymes.length, claps.length); i++) {
    if (rhymes[i]) out.push(rhymes[i]);
    if (claps[i]) out.push(claps[i]);
  }
  return out.slice(0, ROUNDS + 2);
}

/** Builds the exercises for one activity. Returns [] when there is nothing (e.g. no group). */
export function buildExercises(activityId: ActivityId, opts: BuildOptions = {}): Exercise[] {
  const random = opts.random ?? Math.random;
  const { category, myWords } = opts;

  switch (activityId) {
    case 'sounds':
      // Sounds open the Sound Practice screens (see activities.ts `route`); this list is the
      // same practice for callers that want it inline.
      return SOUND_EXERCISES.map((s) => say(`sound-${s.id}`, soundItem(s.id)));

    case 'syllables':
      // Explicit models only: each syllable plays its recording, never a TTS guess.
      return category ? syllablesFor(category).map((s) => say(`syl-${s.id}`, syllableItem(s.id, getSoundExercise(category)?.emoji))) : [];

    case 'words':
    case 'vocabulary':
      return wordsFor(category, myWords).map((w) => say(`word-${w.id}`, withWordModel(w)));

    case 'repetition':
      return shuffle(thingVocabulary(), random).slice(0, ROUNDS).map((w) => say(`rep-${w.id}`, withWordModel(w)));

    case 'listening':
      return listening(random);

    case 'matching':
      return matching(random);

    case 'pictureNaming':
      return pictureNaming(random, myWords);

    case 'imitation':
      // "Ma" / "Ba" are syllables: same explicit models as the Syllables activity.
      return IMITATION.map(({ mode, ...item }) => say(item.id, item.syllable ? { ...item, ...syllableItem(item.syllable), id: item.id } : item, { mode }));

    case 'phrases': {
      const mine = myWordItems(myWords)
        .filter((w) => w.phrase.trim() && w.phrase.trim().toLowerCase() !== w.text.trim().toLowerCase())
        .map((w) => ({ ...w, id: `${w.id}-phrase`, text: w.phrase }));
      return [...PHRASES.map((p) => ({ ...p, modelKey: modelKey('phrase', p.id) })), ...mine].map((p) => say(p.id, p));
    }

    case 'sentences':
      return sentences(random, myWords);

    case 'questions':
      return questions();

    case 'stories': {
      const story = STORIES.find((s) => s.id === category);
      if (!story) return [];
      return [
        {
          kind: 'story',
          id: story.id,
          title: story.title,
          pages: story.pages,
          questions: story.questions.map((q) => ({
            kind: 'choose',
            id: `${story.id}-${q.id}`,
            prompt: q.question,
            listen: [{ id: `say-${story.id}-${q.id}`, text: q.question }],
            choices: q.choices,
            answerIds: [q.answerId],
            display: 'picture',
          })),
        },
      ];
    }

    case 'directions':
      return directions(random);

    case 'turnTaking':
      return TURN_GAMES.map((game) => ({ kind: 'turns', id: game.id, game }));

    case 'social':
      return SOCIAL.filter((s) => s.category === category).map(({ category: _c, ...item }) => say(item.id, item));

    case 'rolePlay':
      return ROLE_PLAY.flatMap((scene) => scene.lines.map((line) => say(`${scene.id}-${line.id}`, { ...line, id: `${scene.id}-${line.id}` }, { context: scene.place })));

    case 'memory':
      return memory(random);

    case 'rhythm':
      return rhythm(random);

    case 'voice':
      return VOICE.map(({ hint, ...item }) => say(item.id, item, { hint }));
  }
}

/** Every word item an exercise asks the child to say or pick — used for "words practiced". */
export function exerciseItemText(ex: Exercise): string {
  switch (ex.kind) {
    case 'say':
    case 'clap':
      return ex.item.text;
    case 'choose': {
      const answers = ex.choices.filter((c) => ex.answerIds.includes(c.id));
      return answers.map((a) => a.text).join(', ');
    }
    case 'build':
      return ex.frame.starter;
    case 'story':
      return ex.title;
    case 'turns':
      return ex.game.item.text;
  }
}
