// Checks the localization system. Run: npm run check:i18n
import { DEFAULT_LOCALE_CODE, LOCALES, getLocale, interpolate } from '../src/i18n/registry';
import { en } from '../src/i18n/locales/en';
import { DEFAULT_BUTTONS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../src/constants/defaults';
import { layoutSchoolText } from '../src/adaptive/schoolText';
import type { Strings } from '../src/i18n/types';
import { forEnglishVoice, isEnglishVoice } from '../src/services/pronunciationLexicon';
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

// The English voice lexicon is empty (Filipino was removed): text passes through untouched.
ok(forEnglishVoice('Ate') === 'Ate' && forEnglishVoice('I want Ate.') === 'I want Ate.', 'no word is respelled');
ok(forEnglishVoice('I ate lunch.') === 'I ate lunch.', 'the English verb ate is untouched');
ok(isEnglishVoice('en-US') && isEnglishVoice(undefined) && !isEnglishVoice('es-ES'), 'a Spanish voice gets the text as written');

// ---- CONTENT language: what a lesson is written in, which is not the app language ------------
// The interface is English-only; the schoolwork is not. A lesson states its own language so it
// can be SPOKEN in it, and nothing anywhere guesses the language from the text.
ok(normalizeContentLanguage('es-ES') === 'es-ES', 'the Spanish tag is kept');
ok(normalizeContentLanguage('es_ES') === 'es-ES', 'an underscored tag is normalised');
ok(normalizeContentLanguage('fil-PH') === '' && normalizeContentLanguage('TL-ph') === '', 'the removed Filipino/Tagalog tags fall back to the app voice');
ok(normalizeContentLanguage('en-GB') === '' && normalizeContentLanguage('') === '', 'English means the app voice');
ok(normalizeContentLanguage('xx-YY') === '', 'an unknown language falls back to the app voice');
ok(contentLanguage('es-ES')?.label === 'Spanish', 'the tag resolves to its entry');
ok(contentLanguage('fil-PH') === null && !CONTENT_LANGUAGES.some((l) => /filipino|tagalog/i.test(l.label)), 'there is no Filipino content language');

// Engines disagree about how they name a language, so matching is by SUBTAG.
const es = contentLanguage('es-ES')!;
ok(voiceSpeaks(es, 'es-ES') && voiceSpeaks(es, 'es_ES') && voiceSpeaks(es, 'es-MX'), 'a Spanish voice is recognised however the engine spells it');
ok(!voiceSpeaks(es, 'en-US') && !voiceSpeaks(es, '') && !voiceSpeaks(es, null), 'an English voice is not mistaken for a Spanish one');
ok(CONTENT_LANGUAGES.every((l) => l.voicePrefixes.length > 0 && l.tag.includes('-')), 'every content language has a tag and at least one voice prefix');

// ---- every lesson states its language ----------------------------------------------------------
DEMO_LESSONS.forEach((d) => {
  ok(normalizeContentLanguage(d.lesson.language) === d.lesson.language, `${d.subjectName}: the lesson language is a canonical tag`);
});
ok(!DEMO_LESSONS.some((d) => d.subjectName === 'Filipino' || /Mga hayop/.test(d.lesson.title)), 'no Filipino lesson ships');
ok(DEMO_LESSONS.every((d) => d.lesson.language === ''), 'English lessons keep the app voice');

console.log(`locales ${LOCALES.length}, strings ${keys.length}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
