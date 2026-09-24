// Checks Speech Practice content and the exercise engine. Run: npm run check:speech
import { ACTIVITIES, LEVELS, parseHiddenActivities, serializeHiddenActivities } from '../src/speechpractice/activities';
import { buildExercises, categoriesFor, composeSentence, exerciseItemText, seededRandom, twoStepDirection } from '../src/speechpractice/engine';
import { SENTENCE_FRAMES } from '../src/speechpractice/content';
import { VOCAB_CATEGORIES, VOCABULARY, vocabById } from '../src/speechpractice/vocabulary';
import { SOUND_EXERCISES } from '../src/soundpractice/content';
import { en } from '../src/i18n/locales/en';
import type { ActivityId, Exercise, MyWord } from '../src/speechpractice/types';
import { SUBJECT_ICON_CHOICES, UI_ICONS, uiIcon } from '../src/constants/uiIcons';
import { LEARNING_SUBJECTS } from '../src/learning';
import { WRITING_LEVELS } from '../src/adaptive/handwriting';
import { ANSWER_METHOD_META } from '../src/adaptive/types';
import { ACTIVITY_CATEGORY_META, SECTION_EMOJI } from '../src/constants/school';
import { DEFAULT_SUBJECTS } from '../src/constants/defaults';
import { PRONUNCIATION_SETS, SYLLABLES, SYLLABLE_CONSONANTS, VOWELS, getSyllable, modelKey, overrideKey, parseModelKey, parseOverrides } from '../src/speechpractice/pronunciation';
import { SPOKEN_OVERRIDES, syllablePronunciation } from '../src/speechpractice/pronunciationDictionary';
import { BUNDLED_MODEL_AUDIO } from '../src/speechpractice/modelAudio';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GLYPHS: Record<string, number> = require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

// ---- Activities -----------------------------------------------------------------------------
ok(ACTIVITIES.length === 20, 'twenty activities');
ok(new Set(ACTIVITIES.map((a) => a.id)).size === 20, 'activity ids are unique');
for (const a of ACTIVITIES) ok(en.strings[a.titleKey], `${a.id}: has a title string`);
for (const l of LEVELS) ok(ACTIVITIES.some((a) => a.level === l.level), `${l.level}: has activities`);
ok(serializeHiddenActivities(parseHiddenActivities('voice, nonsense ,words')) === 'words,voice', 'hidden setting round-trips and drops unknown ids');
ok(parseHiddenActivities('').size === 0, 'nothing hidden by default');

// ---- Sounds: the spec's set -------------------------------------------------------------------
for (const s of ['A', 'B', 'M', 'P', 'T', 'D', 'K', 'G', 'F', 'S', 'N']) ok(SOUND_EXERCISES.some((e) => e.sound === s), `sound ${s} present`);

// ---- Every activity builds exercises, for every group ---------------------------------------
const myWords: MyWord[] = [
  { id: 7, label: 'Grandma', phrase: 'I want Grandma.', icon: '👵', imageUri: 'file:///photo.jpg' },
  { id: 8, label: 'Max', phrase: 'Max', icon: 'dog', imageUri: null },
];

function checkExercise(activity: ActivityId, ex: Exercise) {
  const where = `${activity}/${ex.id}`;
  ok(exerciseItemText(ex).length > 0, `${where}: has an item to log`);
  if (ex.kind === 'choose') {
    ok(ex.choices.length >= 2 && ex.choices.length <= 6, `${where}: 2–6 choices (${ex.choices.length})`);
    ok(ex.answerIds.length >= 1, `${where}: has an answer`);
    for (const id of ex.answerIds) ok(ex.choices.some((c) => c.id === id), `${where}: answer ${id} is a choice`);
    ok(new Set(ex.choices.map((c) => c.id)).size === ex.choices.length, `${where}: choice ids unique`);
    ok(ex.prompt || ex.promptKey, `${where}: has a prompt`);
    if (ex.promptKey) ok(en.strings[ex.promptKey], `${where}: prompt key exists`);
    if (ex.preview) ok(ex.preview.every((p) => ex.answerIds.includes(p.id)), `${where}: memory answers are what was shown`);
  }
  if (ex.kind === 'say') ok(ex.item.text.trim().length > 0, `${where}: says something`);
  if (ex.kind === 'build') ok(ex.cards.length >= 2, `${where}: has cards`);
  if (ex.kind === 'story') {
    ok(ex.pages.length >= 2 && ex.pages.length <= 5, `${where}: short story`);
    ok(ex.questions.length >= 1, `${where}: has questions`);
    ex.questions.forEach((q) => checkExercise(activity, q));
  }
  if (ex.kind === 'clap') ok(ex.beats.length >= 1, `${where}: has beats`);
  if (ex.kind === 'turns') ok(ex.game.options.length >= 2 && ex.game.rounds >= 1, `${where}: playable game`);
}

let total = 0;
for (const a of ACTIVITIES) {
  const groups = categoriesFor(a.id, myWords);
  const keys = groups ? groups.map((g) => g.key) : [undefined];
  for (const key of keys) {
    for (const seed of [1, 2, 3]) {
      const list = buildExercises(a.id, { category: key, myWords, random: seededRandom(seed) });
      ok(list.length > 0, `${a.id}${key ? `/${key}` : ''}: builds exercises`);
      ok(new Set(list.map((e) => e.id)).size === list.length, `${a.id}${key ? `/${key}` : ''}: exercise ids unique`);
      list.forEach((e) => checkExercise(a.id, e));
      total += list.length;
    }
  }
}

// Groups: My Words appears only when there are words.
ok(categoriesFor('words', [])!.every((g) => g.key !== 'my'), 'no My Words group without words');
ok(categoriesFor('words', myWords)![0].key === 'my', 'My Words group first when present');
ok(buildExercises('words', { category: 'my', myWords }).length === 2, 'My Words become word exercises');
ok(buildExercises('phrases', { myWords }).some((e) => e.kind === 'say' && e.item.text === 'I want Grandma.'), "a My Word's phrase is practised");
const naming = buildExercises('pictureNaming', { myWords, random: seededRandom(4) });
ok(naming[0].kind === 'choose' && naming[0].show?.[0].imageUri === 'file:///photo.jpg', 'a parent photo leads Picture Naming');

// ---- Speech details ---------------------------------------------------------------------------
const want = SENTENCE_FRAMES.find((f) => f.id === 'want')!;
const give = SENTENCE_FRAMES.find((f) => f.id === 'give')!;
const help = SENTENCE_FRAMES.find((f) => f.id === 'help')!;
ok(composeSentence(want, vocabById('v-apple')!) === 'I want an apple.', 'an apple');
ok(composeSentence(want, vocabById('v-ball')!) === 'I want a ball.', 'a ball');
ok(composeSentence(want, vocabById('v-milk')!) === 'I want milk.', 'milk has no article');
ok(composeSentence(want, vocabById('v-mama')!) === 'I want Mama.', 'names have no article');
ok(composeSentence(give, vocabById('v-cup')!) === 'Give me the cup.', 'give me the cup');
ok(composeSentence(help, vocabById('v-eat')!) === 'Help me eat.', 'help me eat');
ok(composeSentence(want, { id: 'my-7', text: 'Grandma', name: true }) === 'I want Grandma.', 'my word is a name');

// Two-step directions are ready for a later version.
const r = seededRandom(9);
const two = twoStepDirection(vocabById('v-dog')!, vocabById('v-ball')!, [vocabById('v-cat')!, vocabById('v-cup')!], r);
ok(two.ordered && two.answerIds.join() === 'v-dog,v-ball', 'two-step direction is ordered');

// ---- Content hygiene ------------------------------------------------------------------------
ok(new Set(VOCABULARY.map((v) => v.id)).size === VOCABULARY.length, 'vocabulary ids unique');
for (const c of VOCAB_CATEGORIES) ok(VOCABULARY.filter((v) => v.category === c.key).length >= 4, `${c.key}: at least four words`);
// Nothing clinical, nothing that grades the child, anywhere in the child-facing strings.
const childText = Object.values(en.strings).join(' ').toLowerCase();
for (const banned of ['disorder', 'diagnos', 'score', 'wrong', 'incorrect', 'failed', '%']) {
  ok(!childText.includes(banned), `child-facing text never says "${banned}"`);
}

// ---- Syllables: explicit models, never a TTS guess ------------------------------------------
ok(SYLLABLES.length === 50, `50 syllables (${SYLLABLES.length})`);
for (const c of ['b', 'm', 'p', 't', 'd', 'k', 'g', 's', 'n', 'f']) for (const v of VOWELS) ok(getSyllable(c + v), `syllable ${(c + v).toUpperCase()} in the library`);
ok(SYLLABLE_CONSONANTS.join('') === 'bmptdkgsnf', 'consonant rows in teaching order');
for (const s of SYLLABLES) for (const { key } of PRONUNCIATION_SETS) {
  ok(/^\/[^/]+\/$/.test(s.pronunciation[key].ipa), `${s.display}: ${key} IPA is explicit`);
  ok(s.pronunciation[key].guide.length > 0, `${s.display}: ${key} has a recording guide`);
}
ok(getSyllable('bo')!.pronunciation.en.ipa === '/boʊ/', 'English BO is /boʊ/ (as in go)');
for (const { key } of PRONUNCIATION_SETS) for (const v of VOWELS) ok(getSyllable('g' + v)!.pronunciation[key].ipa.startsWith('/ɡ'), `${key}/G${v.toUpperCase()}: G is always hard`);
ok(getSyllable('ge')!.pronunciation.en.ipa === '/ɡiː/', 'English GE is /ɡiː/ (long e, hard g)');
for (const c of SYLLABLE_CONSONANTS) {
  const list = buildExercises('syllables', { category: c });
  ok(list.length === 5, `syllables/${c}: five syllables`);
  for (const e of list) {
    if (e.kind !== 'say') { ok(false, 'syllable exercise is a say exercise'); continue; }
    ok(e.item.strict === true, `${e.item.text}: recording only (strict)`);
    ok(e.item.modelKey === modelKey('syllable', e.item.text.toLowerCase()), `${e.item.text}: model key`);
    ok(e.item.speak === undefined, `${e.item.text}: no text for a voice engine to guess at`);
  }
}
for (const e of buildExercises('imitation')) if (e.kind === 'say' && ['Ma', 'Ba'].includes(e.item.text)) ok(e.item.strict && e.item.modelKey?.startsWith('syllable:'), `imitation ${e.item.text} uses the syllable model`);
for (const e of buildExercises('words', { category: 'animals' })) if (e.kind === 'say') ok(e.item.modelKey === modelKey('word', e.item.id), `word ${e.item.text} has a model key`);
for (const e of buildExercises('phrases')) if (e.kind === 'say' && e.item.id.startsWith('ph-')) ok(e.item.modelKey === modelKey('phrase', e.item.id), `phrase ${e.item.id} has a model key`);
// ---- Pronunciation dictionary: every syllable, every set, a pronunciation-safe spoken form ----
// Real English words that ARE the target syllable, so the raw text is already safe to speak.
const RAW_IS_A_WORD = new Set(['go', 'so', 'no', 'me']);
for (const s of SYLLABLES) {
  for (const { key } of PRONUNCIATION_SETS) {
    const e = syllablePronunciation(key, s.id);
    ok(e, `${key}/${s.display}: has a dictionary entry`);
    if (!e) continue;
    ok(e.display === s.display, `${key}/${s.display}: display text matches`);
    ok(e.ipa === s.pronunciation[key].ipa, `${key}/${s.display}: IPA agrees with pronunciation.ts (${e.ipa} vs ${s.pronunciation[key].ipa})`);
    ok(e.guide.trim().length > 0, `${key}/${s.display}: has a guide`);
    ok(e.spoken.text.trim().length > 0, `${key}/${s.display}: has a spoken form`);
    ok(e.alternatives.length >= 1, `${key}/${s.display}: has an alternative to try`);
    for (const f of [e.spoken, ...e.alternatives]) ok(/^[a-z]{2,3}-[A-Z]{2}$/.test(f.locale), `${key}/${s.display}: "${f.text}" has a locale`);
    if (key === 'en') ok(e.spoken.locale === 'en-US', `en/${s.display}: English is spoken by an English voice`);
    // The whole point: the raw syllable is never what the default hands to an engine.
    if (key === 'en' && !RAW_IS_A_WORD.has(s.id)) ok(e.spoken.text.toLowerCase() !== s.id, `en/${s.display}: default is not the raw syllable`);
  }
}
ok(syllablePronunciation('en', 'bo')!.spoken.text === 'beau' && syllablePronunciation('en', 'bo')!.ipa === '/boʊ/', 'English BO → "beau" (/boʊ/, as in go)');
ok(syllablePronunciation('en', 'bo')!.alternatives.some((f) => f.text === 'bow'), 'English BO can be switched to "bow"');
ok(syllablePronunciation('en', 'ma')!.spoken.text === 'mah' && syllablePronunciation('en', 'ma')!.ipa === '/mɑ/', 'English MA → "mah" (/mɑ/, the open ah of mama)');
ok(syllablePronunciation('en', 'me')!.spoken.text === 'me' && syllablePronunciation('en', 'me')!.ipa === '/miː/', 'English ME → "me" (/miː/, rhymes with bee)');
// Long vowels: every English syllable in a row sounds different (BA bay, BE bee, BI bye, BO beau, BU boo).
for (const c of SYLLABLE_CONSONANTS) {
  const ipas = VOWELS.map((v) => syllablePronunciation('en', c + v)!.ipa);
  ok(new Set(ipas).size === 5, `en/${c.toUpperCase()}: five different sounds (${ipas.join(' ')})`);
}
for (const id of ['ga', 'ge', 'gi', 'go', 'gu']) ok(!/^ge|^gi/.test(syllablePronunciation('en', id)!.spoken.text), `en/${id.toUpperCase()}: G stays hard (never "ge…"/"gi…")`);
ok(Object.keys(SPOKEN_OVERRIDES).every((k) => parseModelKey(k)), 'word/phrase overrides use model keys');
ok(Object.keys(parseOverrides('not json')).length === 0, 'overrides: bad JSON is ignored');
ok(Object.keys(parseOverrides('{"en|syllable:ba":"bah"}')).length === 0, 'overrides: an old plain-string value is ignored');
ok(parseOverrides('{"en|syllable:bo":{"text":"bow","locale":"en-US"}}')[overrideKey('en', 'syllable:bo')]?.text === 'bow', 'overrides: a chosen form is read back');
ok(parseModelKey('syllable:ba')?.kind === 'syllable' && parseModelKey('nonsense') === null, 'model keys parse');
for (const { key } of PRONUNCIATION_SETS) for (const k of Object.keys(BUNDLED_MODEL_AUDIO[key])) ok(parseModelKey(k), `bundled ${key} model key ${k} is valid`);

// ---- Interface icons: one line-icon style, no emoji left in the chrome ---------------------
for (const [emoji, v] of Object.entries(UI_ICONS)) ok(v.icon in GLYPHS, `icon for ${emoji} exists: ${v.icon}`);
for (const n of SUBJECT_ICON_CHOICES) ok(n in GLYPHS, `subject icon ${n} exists`);
for (const a of ACTIVITIES) ok(a.icon in GLYPHS, `${a.id}: icon ${a.icon} exists`);
const chrome = [
  ...Object.values(SECTION_EMOJI), ...LEVELS.map((l) => l.emoji),
  ...LEARNING_SUBJECTS.flatMap((s) => [s.emoji, ...s.activities.map((a) => a.emoji)]),
  ...WRITING_LEVELS.map((l) => l.emoji), ...Object.values(ANSWER_METHOD_META).map((m) => m.emoji),
  ...Object.values(ACTIVITY_CATEGORY_META).map((m) => m.emoji), ...DEFAULT_SUBJECTS.map((s) => s.icon),
];
for (const e of chrome) ok(uiIcon(e), `interface emoji ${e} has a line icon`);

console.log(`activities ${ACTIVITIES.length}, vocabulary ${VOCABULARY.length}, exercises built ${total}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
