// Checks the localization system. Run: npm run check:i18n
import { DEFAULT_LOCALE_CODE, LOCALES, getLocale, interpolate } from '../src/i18n/registry';
import { en } from '../src/i18n/locales/en';
import { DEFAULT_BUTTONS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../src/constants/defaults';
import { layoutSchoolText } from '../src/adaptive/schoolText';
import type { Strings } from '../src/i18n/types';
import { forEnglishVoice, isEnglishVoice } from '../src/services/pronunciationLexicon';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

// US English is the default everywhere.
ok(DEFAULT_SETTINGS.language === 'en-US', 'US English is the default language');
ok(DEFAULT_LOCALE_CODE === 'en-US', 'US English is the default locale code');
ok(LOCALES[0].code === 'en-US', 'English is listed first in the language selector');
ok(getLocale('xx-YY').code === 'en-US', 'an unknown code falls back to English');
ok(getLocale(null).code === 'en-US', 'a missing code falls back to English');
ok(en.letterStyle === 'standard', 'English uses the ordinary double-storey a');
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
  ok(locale.letterStyle === 'standard', `${locale.code}: ordinary double-storey a`);
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

// Handwriting: no locale uses the single-storey school-print "a" now, but the glyph is kept and
// must still differ only in "a".
const stdA = layoutSchoolText('a', 400, 200, 'standard');
const printA = layoutSchoolText('a', 400, 200, 'single-storey');
ok(stdA.glyphs[0].d !== printA.glyphs[0].d, 'the two letter styles draw a different a');
for (const ch of ['A', 'b', 'c', 'd', 'e', 'f', 'o', 'g', '5']) {
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

console.log(`locales ${LOCALES.length}, strings ${keys.length}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
