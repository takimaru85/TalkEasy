// Checks the localization system. Run: npm run check:i18n
import { DEFAULT_LOCALE_CODE, LOCALES, getLocale, interpolate } from '../src/i18n/registry';
import { en } from '../src/i18n/locales/en';
import { DEFAULT_BUTTONS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../src/constants/defaults';
import { layoutSchoolText } from '../src/adaptive/schoolText';
import type { Strings } from '../src/i18n/types';
import { forEnglishVoice, forEnglishVoiceSpeakingFilipino, isEnglishVoice } from '../src/services/pronunciationLexicon';
import { CONTENT_LANGUAGES, contentLanguage, normalizeContentLanguage, voiceSpeaks } from '../src/services/contentLanguage';
import { DEMO_LESSONS } from '../src/adaptive/demoLessons';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

// US English is the default everywhere.
ok(DEFAULT_SETTINGS.language === 'en-US', 'US English is the default language');
ok(DEFAULT_LOCALE_CODE === 'en-US', 'US English is the default locale code');
ok(LOCALES[0].code === 'en-US', 'English is listed first in the language selector');
ok(getLocale('xx-YY').code === 'en-US', 'an unknown code falls back to English');
ok(getLocale(null).code === 'en-US', 'a missing code falls back to English');
// Handwriting, not typography: the app's TEXT is ordinary Nunito, but a child is taught to
// write "a" as a circle and a stem, so the tracing surfaces use the school-print form.
ok(en.letterStyle === 'single-storey', 'handwriting uses the school-print a');
ok(Object.keys(en.content).length === 0, 'English needs no content translation');

// Every locale is complete, so no screen can fall back to a stray English word.
const keys = Object.keys(en.strings) as (keyof Strings)[];
for (const locale of LOCALES) {
  ok(/^[a-z]{2,3}-[A-Z]{2}$/.test(locale.code), `${locale.code}: BCP-47 shaped code`);
  ok(locale.speechTag.length > 0 && locale.name.length > 0 && locale.flag.length > 0, `${locale.code}: has a name, flag and speech tag`);
  for (const k of keys) ok(locale.strings[k]?.trim(), `${locale.code}: string "${k}"`);
  ok(Object.keys(locale.strings).length === keys.length, `${locale.code}: no extra string keys`);
  // TalkEasy is English-only: every locale is an English variant with an English voice.
  ok(locale.speechTag.startsWith('en-'), `${locale.code}: speaks with an English voice`);
  ok(locale.letterStyle === 'single-storey', `${locale.code}: school-print a on handwriting surfaces`);
}
ok(LOCALES.map((l) => l.code).join() === 'en-US,en-GB,en-AU,en-NZ', 'US, UK, Australian and New Zealand English, US first');
ok(getLocale('fil-PH').code === 'en-US', 'a saved Filipino setting falls back to US English');

// {name} interpolation, used by the celebration lines.
for (const locale of LOCALES) ok(locale.strings.greatJob.includes('{name}'), `${locale.code}: greatJob keeps {name}`);
ok(interpolate('Hi {name}!', { name: 'Brayden' }) === 'Hi Brayden!', 'interpolation replaces');
ok(interpolate('Hi {who}!', { name: 'x' }) === 'Hi {who}!', 'unknown placeholder is left alone');
ok(interpolate('Hi {name}!') === 'Hi {name}!', 'no vars is safe');

// UK / Australian / New Zealand English: Commonwealth spelling and "Mum", nothing else.
const seeded = new Set([...DEFAULT_BUTTONS.flatMap((b) => [b.label, b.phrase]), ...DEFAULT_CATEGORIES.map((c) => c.name)]);
for (const locale of LOCALES) {
  if (locale.code === 'en-US') continue;
  ok(locale.strings.sectionFavorites === 'Favourites', `${locale.code}: Favourites`);
  ok(locale.strings.spPracticeAgain === 'Practise again', `${locale.code}: practise (verb)`);
  ok(locale.content['Mom'] === 'Mum' && locale.content['Please call Mom.'] === 'Please call Mum.', `${locale.code}: Mum`);
  for (const k of Object.keys(locale.content)) ok(seeded.has(k), `${locale.code}: content key "${k}" is seeded text`);
  ok(locale.content['Brayden picked this'] === undefined, `${locale.code}: custom text is not in the map`);
  const differs = keys.filter((k) => locale.strings[k] !== en.strings[k]);
  ok(differs.every((k) => /practis|favourite|individualis/i.test(locale.strings[k])), `${locale.code}: only spelling differs (${differs.join(', ')})`);
}

// Handwriting: the school-print style swaps exactly two letters — "a" (circle and stem) and
// "l" (a plain bar, because Nunito's "l" ends in a curved tail a child would copy as a hook).
// Every other character must be byte-identical in both styles.
for (const ch of ['a', 'l']) {
  const std = layoutSchoolText(ch, 400, 200, 'standard');
  const print = layoutSchoolText(ch, 400, 200, 'single-storey');
  ok(std.glyphs[0].d !== print.glyphs[0].d, `the two letter styles draw a different "${ch}"`);
}
const printL = layoutSchoolText('l', 400, 200, 'single-storey');
ok(printL.glyphs[0].d === layoutSchoolText('I', 400, 200, 'single-storey').glyphs[0].d, 'the school-print l is the plain bar');
for (const ch of ['A', 'b', 'c', 'd', 'e', 'f', 'o', 'g', '5', 'i', 't']) {
  const a = layoutSchoolText(ch, 400, 200, 'standard');
  const b = layoutSchoolText(ch, 400, 200, 'single-storey');
  ok(a.glyphs[0].d === b.glyphs[0].d, `"${ch}" is identical in both letter styles`);
}

// Filipino words spoken by an English voice: pronunciation-safe spelling, display unchanged.
ok(forEnglishVoice('Ate') === 'ah-teh', 'Ate is spoken ah-teh');
ok(forEnglishVoice('I want Ate.') === 'I want ah-teh.', 'the Ate tile phrase');
ok(forEnglishVoice('I ate lunch.') === 'I ate lunch.', 'the English verb ate is untouched');
ok(forEnglishVoice('Theater, Kuyas') === 'Theater, Kuyas', 'only whole words change');
ok(forEnglishVoice('Kuya and Lola') === 'koo-yah and loh-lah', 'other kinship words');
ok(forEnglishVoice('Ate (older sister)') === 'ah-teh (older sister)', 'Learn distractor text');
ok(isEnglishVoice('en-US') && isEnglishVoice(undefined) && !isEnglishVoice('fil-PH'), 'a Filipino voice gets the text as written');

// ---- CONTENT language: what a lesson is written in, which is not the app language ------------
// The interface is English-only; the schoolwork is not. A lesson states its own language so it
// can be SPOKEN in it, and nothing anywhere guesses the language from the text.
ok(normalizeContentLanguage('fil-PH') === 'fil-PH', 'the Filipino tag is kept');
ok(normalizeContentLanguage('fil_PH') === 'fil-PH', 'an underscored tag is normalised');
ok(normalizeContentLanguage('TL-ph') === 'fil-PH', 'Tagalog resolves to the Filipino entry');
ok(normalizeContentLanguage('en-GB') === '' && normalizeContentLanguage('') === '', 'English means the app voice');
ok(normalizeContentLanguage('xx-YY') === '', 'an unknown language falls back to the app voice');
ok(contentLanguage('fil-PH')?.label === 'Filipino', 'the tag resolves to its entry');

// Engines disagree about how they name a language, so matching is by SUBTAG. Demanding an exact
// tag is how a device that HAS a Filipino voice ends up reading Filipino with an English one.
const fil = contentLanguage('fil-PH')!;
ok(voiceSpeaks(fil, 'fil-PH') && voiceSpeaks(fil, 'fil_PH') && voiceSpeaks(fil, 'tl-PH'), 'a Filipino voice is recognised however the engine spells it');
ok(!voiceSpeaks(fil, 'en-US') && !voiceSpeaks(fil, '') && !voiceSpeaks(fil, null), 'an English voice is not mistaken for a Filipino one');
ok(CONTENT_LANGUAGES.every((l) => l.voicePrefixes.length > 0 && l.tag.includes('-')), 'every content language has a tag and at least one voice prefix');

// ---- the fallback, for a device with no Filipino voice ----------------------------------------
// "mga" is ONE Filipino word, /maˈŋa/. Read by an English voice it comes out as the three letters
// M-G-A, which is the bug this exists to stop. The display text never changes.
const mga = forEnglishVoiceSpeakingFilipino('Mga hayop');
ok(!/m[\s-]*g[\s-]*a/i.test(mga.replace(/mahng/gi, '')), 'mga is never handed over as three letters');
ok(mga === 'mahng-ah hah-yop', 'Mga hayop is respelled as one word plus the noun');
ok(forEnglishVoiceSpeakingFilipino('Aso ang tawag sa dog.') === 'ah-soh ahng tah-wahg sah dog.', 'the animals sentence');
ok(forEnglishVoiceSpeakingFilipino('Pusa ang tawag sa cat.') === 'poo-sah ahng tah-wahg sah cat.', 'the cat sentence');
ok(forEnglishVoiceSpeakingFilipino('Ibon') === 'ee-bohn' && forEnglishVoiceSpeakingFilipino('Isda') === 'ees-dah', 'the remaining animals');
ok(forEnglishVoiceSpeakingFilipino('Alin ang aso?') === 'ah-leen ahng ah-soh?', 'the Filipino question');

// The function words only exist in the Filipino lexicon, so ordinary English is left alone by the
// global one — "sa" and "ang" applied app-wide would mangle every English sentence in TalkEasy.
ok(forEnglishVoice('Sing a song, Ang') === 'Sing a song, Ang', 'the global lexicon leaves English words alone');
ok(forEnglishVoice('Mga') === 'Mga', 'the Filipino fallback is not applied to English content');

// A word in both lexicons is respelled once, by the more specific list.
ok(forEnglishVoiceSpeakingFilipino('Ate ang bata') === 'ah-teh ahng bah-tah', 'the two lexicons compose without colliding');

// ---- every lesson states its language ----------------------------------------------------------
DEMO_LESSONS.forEach((d) => {
  ok(normalizeContentLanguage(d.lesson.language) === d.lesson.language, `${d.subjectName}: the lesson language is a canonical tag`);
});
const filipino = DEMO_LESSONS.find((d) => d.subjectName === 'Filipino');
ok(filipino?.lesson.language === 'fil-PH', 'the Filipino lesson is marked Filipino');
ok(DEMO_LESSONS.filter((d) => d.subjectName !== 'Filipino').every((d) => d.lesson.language === ''), 'English lessons keep the app voice');

console.log(`locales ${LOCALES.length}, strings ${keys.length}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
