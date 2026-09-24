// Checks the localization system. Run: npm run check:i18n
import { DEFAULT_LOCALE_CODE, LOCALES, getLocale, interpolate } from '../src/i18n/registry';
import { en } from '../src/i18n/locales/en';
import { DEFAULT_BUTTONS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../src/constants/defaults';
import { layoutSchoolText } from '../src/adaptive/schoolText';
import type { Strings } from '../src/i18n/types';

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
  // A translation that is still the English text is almost always an oversight.
  if (locale.code !== 'en-US') {
    const same = keys.filter((k) => locale.strings[k] === en.strings[k]);
    ok(same.length === 0, `${locale.code}: untranslated strings: ${same.join(', ')}`);
  }
}

// {name} interpolation, used by the celebration lines.
for (const locale of LOCALES) ok(locale.strings.greatJob.includes('{name}'), `${locale.code}: greatJob keeps {name}`);
ok(interpolate('Hi {name}!', { name: 'Brayden' }) === 'Hi Brayden!', 'interpolation replaces');
ok(interpolate('Hi {who}!', { name: 'x' }) === 'Hi {who}!', 'unknown placeholder is left alone');
ok(interpolate('Hi {name}!') === 'Hi {name}!', 'no vars is safe');

// The words the child taps must be translated in every non-English locale.
const CORE = ['Water', 'Mom', 'Dad', 'Help', 'Yes', 'No', 'Hungry', 'Bathroom', 'Home', 'Food'];
for (const locale of LOCALES) {
  if (locale.code === 'en-US') continue;
  for (const word of CORE) ok(locale.content[word], `${locale.code}: core word "${word}"`);
  const missing = DEFAULT_BUTTONS.filter((b) => !locale.content[b.label]).map((b) => b.label);
  ok(missing.length === 0, `${locale.code}: untranslated tile labels: ${missing.join(', ')}`);
  const phrases = DEFAULT_BUTTONS.filter((b) => !locale.content[b.phrase]).map((b) => b.phrase);
  ok(phrases.length === 0, `${locale.code}: untranslated tile phrases: ${phrases.join(', ')}`);
  const cats = DEFAULT_CATEGORIES.filter((c) => !locale.content[c.name]).map((c) => c.name);
  ok(cats.length === 0, `${locale.code}: untranslated categories: ${cats.join(', ')}`);
  // Anything the parent added themselves must pass straight through.
  ok(locale.content['Brayden picked this'] === undefined, `${locale.code}: custom text is not in the map`);
}

// The Filipino letterform must not leak into English.
const fil = getLocale('fil-PH');
ok(fil.letterStyle === 'single-storey', 'Filipino asks for the school-print a');
ok(fil.speechTag === 'fil-PH', 'Filipino speaks with a Filipino voice');
const enA = layoutSchoolText('a', 400, 200, en.letterStyle);
const filA = layoutSchoolText('a', 400, 200, fil.letterStyle);
ok(enA.glyphs[0].d !== filA.glyphs[0].d, 'the two languages draw a different a');
for (const ch of ['A', 'b', 'c', 'd', 'e', 'f', 'o', 'g', '5']) {
  const a = layoutSchoolText(ch, 400, 200, 'standard');
  const b = layoutSchoolText(ch, 400, 200, 'single-storey');
  ok(a.glyphs[0].d === b.glyphs[0].d, `"${ch}" is identical in both languages`);
}

console.log(`locales ${LOCALES.length}, strings ${keys.length}, fil-PH content entries ${Object.keys(getLocale('fil-PH').content).length}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
