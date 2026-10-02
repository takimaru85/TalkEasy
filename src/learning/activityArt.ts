import type { ColorArtName } from '@/components/adventure/ColorArt';

/**
 * The drawing for each shipped Play & Learn subject and activity, by key. Pure (type-only import), so
 * `check:themes` can compare it with the content. Several reuse a drawing the app already has — one
 * book, one set of letter blocks, one flag, one shapes picture — and the rest are in `art/learnArt.tsx`.
 * Content a grown-up adds has no entry and keeps whatever it shows today.
 */
export const LEARN_SUBJECT_ART: Record<string, ColorArtName> = {
  english: 'subject:english',
  filipino: 'subject:filipino',
  math: 'subject:math',
  science: 'subject:science',
  ap: 'subject:social',
  esp: 'subject:values',
};

export const LEARN_ACTIVITY_ART: Record<string, ColorArtName> = {
  'english.letters': 'subject:english',
  'english.vocabulary': 'learn:english_vocabulary',
  'english.picture_match': 'learn:english_picture_match',
  'english.sentences': 'learn:english_sentences',
  'english.reading': 'category:reading',
  'filipino.vocabulary': 'learn:filipino_vocabulary',
  'filipino.word_recognition': 'learn:filipino_word_recognition',
  'filipino.sentences': 'learn:filipino_sentences',
  'filipino.reading': 'category:reading',
  'math.number_recognition': 'subject:math',
  'math.counting': 'learn:math_counting',
  'math.addition': 'learn:math_addition',
  'math.subtraction': 'learn:math_subtraction',
  'math.multiplication': 'learn:math_multiplication',
  'math.comparing': 'learn:math_comparing',
  'math.shapes': 'level:2',
  'math.time': 'learn:math_time',
  'math.money': 'learn:math_money',
  'science.animals': 'learn:science_animals',
  'science.plants': 'learn:science_plants',
  'science.body': 'learn:science_body',
  'science.weather': 'learn:science_weather',
  'science.environment': 'learn:science_environment',
  'ap.family': 'learn:ap_family',
  'ap.community': 'learn:ap_community',
  'ap.symbols': 'subject:filipino',
  'ap.places': 'learn:ap_places',
  'esp.manners': 'learn:esp_manners',
  'esp.sharing': 'learn:esp_sharing',
  'esp.respect': 'learn:esp_respect',
  'esp.helping': 'learn:esp_helping',
  'esp.emotions': 'learn:esp_emotions',
};
