import type { PronunciationSet } from './pronunciation';

/**
 * THE pronunciation dictionary for Speech Practice syllables.
 *
 * The child SEES `display` ("BO"); the voice engine is given `spoken` ("beau") in `spoken.locale`
 * — never the raw syllable, which an engine reads as a word, an abbreviation or letter names.
 * Each entry also carries the intended pronunciation (`ipa`, `guide`) that the spoken form was
 * chosen to produce, and tested `alternatives`.
 *
 * To correct a syllable for every device: change its `spoken` here. Nothing else changes.
 * To correct it on ONE device (engines differ): Parent Mode → Speech Practice → Pronunciation test,
 * "Try alternative" → "Use this". That choice overrides this default on that device only.
 *
 * Two pronunciation sets. "fil" (the default) is the abakada: BA BE BI BO BU with Filipino vowel
 * values — A "ah", E "eh", I "ee", O "oh", U "oo". "en" reads the same letters with English letter
 * names (BE "bee", BI "bye"). Both are spoken by the app's own English voice (US, UK, Australian
 * or New Zealand accent); the SPELLING of each spoken form is what makes that voice say the right
 * sound. A grown-up switches set in Parent Mode → Pronunciation test.
 *
 * English: A is the open "ah" (MA = /mɑ/, "mah", as in "mama"); E, I, O and U say their long sound:
 * BE = /biː/ ("bee"), BI = /baɪ/ ("bye"), BO = /boʊ/ ("beau"), BU = /buː/ ("boo"). The spoken
 * forms are real English words wherever one has exactly the target sound, because engines read real
 * words consistently.
 */

export interface SpokenForm {
  /** Exactly what the voice engine is given. */
  text: string;
  /** BCP-47 locale for the engine, e.g. 'en-US'. */
  locale: string;
}

export interface PronunciationEntry {
  /** What the child sees. */
  display: string;
  /** The intended pronunciation. */
  ipa: string;
  /** Plain-language description of the intended sound (for grown-ups / developers, not the child). */
  guide: string;
  /** The default spoken form. */
  spoken: SpokenForm;
  /** Other forms to try on a device whose engine reads the default wrongly. */
  alternatives: SpokenForm[];
}

export const SYLLABLE_PRONUNCIATIONS: Record<PronunciationSet, Record<string, PronunciationEntry>> = {
  en: {
    // B
    ba: { display: 'BA', ipa: '/bɑ/', guide: '"BA" as one sound: B + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'bah', locale: 'en-US' }, alternatives: [{ text: 'baa', locale: 'en-US' }] },
    be: { display: 'BE', ipa: '/biː/', guide: '"BE" as one sound: B + the long "e" (its letter name), as in "me"', spoken: { text: 'bee', locale: 'en-US' }, alternatives: [{ text: 'be', locale: 'en-US' }] },
    bi: { display: 'BI', ipa: '/baɪ/', guide: '"BI" as one sound: B + the long "i" (its letter name), as in "hi"', spoken: { text: 'bye', locale: 'en-US' }, alternatives: [{ text: 'by', locale: 'en-US' }, { text: 'buy', locale: 'en-US' }] },
    bo: { display: 'BO', ipa: '/boʊ/', guide: '"BO" as one sound: B + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'beau', locale: 'en-US' }, alternatives: [{ text: 'bow', locale: 'en-US' }, { text: 'boe', locale: 'en-US' }] }, // "bow" can be read /baʊ/ (to bow down); "beau" is always /boʊ/.
    bu: { display: 'BU', ipa: '/buː/', guide: '"BU" as one sound: B + the long "oo", as in "boot"', spoken: { text: 'boo', locale: 'en-US' }, alternatives: [{ text: 'booh', locale: 'en-US' }] },
    // M
    ma: { display: 'MA', ipa: '/mɑ/', guide: '"MA" as one sound: M + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'mah', locale: 'en-US' }, alternatives: [{ text: 'ma', locale: 'en-US' }] },
    me: { display: 'ME', ipa: '/miː/', guide: '"ME" as one sound: M + the long "e" (its letter name), as in "me"', spoken: { text: 'me', locale: 'en-US' }, alternatives: [{ text: 'mee', locale: 'en-US' }] },
    mi: { display: 'MI', ipa: '/maɪ/', guide: '"MI" as one sound: M + the long "i" (its letter name), as in "hi"', spoken: { text: 'my', locale: 'en-US' }, alternatives: [{ text: 'mye', locale: 'en-US' }] },
    mo: { display: 'MO', ipa: '/moʊ/', guide: '"MO" as one sound: M + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'mow', locale: 'en-US' }, alternatives: [{ text: 'mo', locale: 'en-US' }] },
    mu: { display: 'MU', ipa: '/muː/', guide: '"MU" as one sound: M + the long "oo", as in "boot"', spoken: { text: 'moo', locale: 'en-US' }, alternatives: [{ text: 'mooh', locale: 'en-US' }] },
    // P
    pa: { display: 'PA', ipa: '/pɑ/', guide: '"PA" as one sound: P + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'pah', locale: 'en-US' }, alternatives: [{ text: 'pa', locale: 'en-US' }] },
    pe: { display: 'PE', ipa: '/piː/', guide: '"PE" as one sound: P + the long "e" (its letter name), as in "me"', spoken: { text: 'pea', locale: 'en-US' }, alternatives: [{ text: 'pee', locale: 'en-US' }] },
    pi: { display: 'PI', ipa: '/paɪ/', guide: '"PI" as one sound: P + the long "i" (its letter name), as in "hi"', spoken: { text: 'pie', locale: 'en-US' }, alternatives: [{ text: 'pye', locale: 'en-US' }] },
    po: { display: 'PO', ipa: '/poʊ/', guide: '"PO" as one sound: P + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'Poe', locale: 'en-US' }, alternatives: [{ text: 'poh', locale: 'en-US' }] },
    pu: { display: 'PU', ipa: '/puː/', guide: '"PU" as one sound: P + the long "oo", as in "boot"', spoken: { text: 'poo', locale: 'en-US' }, alternatives: [{ text: 'pooh', locale: 'en-US' }] },
    // T
    ta: { display: 'TA', ipa: '/tɑ/', guide: '"TA" as one sound: T + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'tah', locale: 'en-US' }, alternatives: [{ text: 'ta', locale: 'en-US' }] },
    te: { display: 'TE', ipa: '/tiː/', guide: '"TE" as one sound: T + the long "e" (its letter name), as in "me"', spoken: { text: 'tea', locale: 'en-US' }, alternatives: [{ text: 'tee', locale: 'en-US' }] },
    ti: { display: 'TI', ipa: '/taɪ/', guide: '"TI" as one sound: T + the long "i" (its letter name), as in "hi"', spoken: { text: 'tie', locale: 'en-US' }, alternatives: [{ text: 'tye', locale: 'en-US' }] },
    to: { display: 'TO', ipa: '/toʊ/', guide: '"TO" as one sound: T + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'toe', locale: 'en-US' }, alternatives: [{ text: 'tow', locale: 'en-US' }] },
    tu: { display: 'TU', ipa: '/tuː/', guide: '"TU" as one sound: T + the long "oo", as in "boot"', spoken: { text: 'too', locale: 'en-US' }, alternatives: [{ text: 'two', locale: 'en-US' }] },
    // D
    da: { display: 'DA', ipa: '/dɑ/', guide: '"DA" as one sound: D + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'dah', locale: 'en-US' }, alternatives: [{ text: 'da', locale: 'en-US' }] },
    de: { display: 'DE', ipa: '/diː/', guide: '"DE" as one sound: D + the long "e" (its letter name), as in "me"', spoken: { text: 'dee', locale: 'en-US' }, alternatives: [{ text: 'D', locale: 'en-US' }] }, // the letter name "D" is exactly /diː/.
    di: { display: 'DI', ipa: '/daɪ/', guide: '"DI" as one sound: D + the long "i" (its letter name), as in "hi"', spoken: { text: 'dye', locale: 'en-US' }, alternatives: [{ text: 'die', locale: 'en-US' }] },
    do: { display: 'DO', ipa: '/doʊ/', guide: '"DO" as one sound: D + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'doe', locale: 'en-US' }, alternatives: [{ text: 'dough', locale: 'en-US' }] },
    du: { display: 'DU', ipa: '/duː/', guide: '"DU" as one sound: D + the long "oo", as in "boot"', spoken: { text: 'doo', locale: 'en-US' }, alternatives: [{ text: 'do', locale: 'en-US' }] },
    // K
    ka: { display: 'KA', ipa: '/kɑ/', guide: '"KA" as one sound: K + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'kah', locale: 'en-US' }, alternatives: [{ text: 'ka', locale: 'en-US' }] },
    ke: { display: 'KE', ipa: '/kiː/', guide: '"KE" as one sound: K + the long "e" (its letter name), as in "me"', spoken: { text: 'key', locale: 'en-US' }, alternatives: [{ text: 'kee', locale: 'en-US' }] },
    ki: { display: 'KI', ipa: '/kaɪ/', guide: '"KI" as one sound: K + the long "i" (its letter name), as in "hi"', spoken: { text: 'kai', locale: 'en-US' }, alternatives: [{ text: 'kye', locale: 'en-US' }] },
    ko: { display: 'KO', ipa: '/koʊ/', guide: '"KO" as one sound: K + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'Coe', locale: 'en-US' }, alternatives: [{ text: 'koe', locale: 'en-US' }] },
    ku: { display: 'KU', ipa: '/kuː/', guide: '"KU" as one sound: K + the long "oo", as in "boot"', spoken: { text: 'coo', locale: 'en-US' }, alternatives: [{ text: 'koo', locale: 'en-US' }] },
    // G
    ga: { display: 'GA', ipa: '/ɡɑ/', guide: '"GA" as one sound: G + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'gah', locale: 'en-US' }, alternatives: [{ text: 'ga', locale: 'en-US' }] },
    ge: { display: 'GE', ipa: '/ɡiː/', guide: '"GE" as one sound: G + the long "e" (its letter name), as in "me"', spoken: { text: 'ghee', locale: 'en-US' }, alternatives: [{ text: 'gee', locale: 'en-US' }] }, // "ghee" keeps the G hard; "gee" is /dʒiː/ (wrong).
    gi: { display: 'GI', ipa: '/ɡaɪ/', guide: '"GI" as one sound: G + the long "i" (its letter name), as in "hi"', spoken: { text: 'guy', locale: 'en-US' }, alternatives: [{ text: 'gai', locale: 'en-US' }] }, // "guy" is exactly /ɡaɪ/.
    go: { display: 'GO', ipa: '/ɡoʊ/', guide: '"GO" as one sound: G + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'go', locale: 'en-US' }, alternatives: [{ text: 'goh', locale: 'en-US' }] },
    gu: { display: 'GU', ipa: '/ɡuː/', guide: '"GU" as one sound: G + the long "oo", as in "boot"', spoken: { text: 'goo', locale: 'en-US' }, alternatives: [{ text: 'gooh', locale: 'en-US' }] },
    // S
    sa: { display: 'SA', ipa: '/sɑ/', guide: '"SA" as one sound: S + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'sah', locale: 'en-US' }, alternatives: [{ text: 'sa', locale: 'en-US' }] },
    se: { display: 'SE', ipa: '/siː/', guide: '"SE" as one sound: S + the long "e" (its letter name), as in "me"', spoken: { text: 'see', locale: 'en-US' }, alternatives: [{ text: 'sea', locale: 'en-US' }] },
    si: { display: 'SI', ipa: '/saɪ/', guide: '"SI" as one sound: S + the long "i" (its letter name), as in "hi"', spoken: { text: 'sigh', locale: 'en-US' }, alternatives: [{ text: 'sai', locale: 'en-US' }] },
    so: { display: 'SO', ipa: '/soʊ/', guide: '"SO" as one sound: S + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'so', locale: 'en-US' }, alternatives: [{ text: 'sew', locale: 'en-US' }] },
    su: { display: 'SU', ipa: '/suː/', guide: '"SU" as one sound: S + the long "oo", as in "boot"', spoken: { text: 'sue', locale: 'en-US' }, alternatives: [{ text: 'soo', locale: 'en-US' }] },
    // N
    na: { display: 'NA', ipa: '/nɑ/', guide: '"NA" as one sound: N + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'nah', locale: 'en-US' }, alternatives: [{ text: 'na', locale: 'en-US' }] },
    ne: { display: 'NE', ipa: '/niː/', guide: '"NE" as one sound: N + the long "e" (its letter name), as in "me"', spoken: { text: 'knee', locale: 'en-US' }, alternatives: [{ text: 'nee', locale: 'en-US' }] },
    ni: { display: 'NI', ipa: '/naɪ/', guide: '"NI" as one sound: N + the long "i" (its letter name), as in "hi"', spoken: { text: 'nigh', locale: 'en-US' }, alternatives: [{ text: 'nye', locale: 'en-US' }] },
    no: { display: 'NO', ipa: '/noʊ/', guide: '"NO" as one sound: N + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'no', locale: 'en-US' }, alternatives: [{ text: 'know', locale: 'en-US' }] },
    nu: { display: 'NU', ipa: '/nuː/', guide: '"NU" as one sound: N + the long "oo", as in "boot"', spoken: { text: 'new', locale: 'en-US' }, alternatives: [{ text: 'noo', locale: 'en-US' }] },
    // F
    fa: { display: 'FA', ipa: '/fɑ/', guide: '"FA" as one sound: F + the open "ah", as in "father" (the first syllable of "mama")', spoken: { text: 'fah', locale: 'en-US' }, alternatives: [{ text: 'fa', locale: 'en-US' }] },
    fe: { display: 'FE', ipa: '/fiː/', guide: '"FE" as one sound: F + the long "e" (its letter name), as in "me"', spoken: { text: 'fee', locale: 'en-US' }, alternatives: [{ text: 'fea', locale: 'en-US' }] },
    fi: { display: 'FI', ipa: '/faɪ/', guide: '"FI" as one sound: F + the long "i" (its letter name), as in "hi"', spoken: { text: 'phi', locale: 'en-US' }, alternatives: [{ text: 'fie', locale: 'en-US' }] }, // "phi" (the Greek letter) is /faɪ/.
    fo: { display: 'FO', ipa: '/foʊ/', guide: '"FO" as one sound: F + the long "o" (its letter name), rhyming with "so" and "go"', spoken: { text: 'foe', locale: 'en-US' }, alternatives: [{ text: 'fo', locale: 'en-US' }] },
    fu: { display: 'FU', ipa: '/fuː/', guide: '"FU" as one sound: F + the long "oo", as in "boot"', spoken: { text: 'foo', locale: 'en-US' }, alternatives: [{ text: 'phoo', locale: 'en-US' }] },
  },

  /**
   * Filipino (abakada) vowel values: A "ah", E "eh", I "ee", O "oh", U "oo" — BA BE BI BO BU,
   * never the English letter names ("bee", "bye"). The spoken forms are handed to the app's own
   * English voice, so each is spelled the way that voice reads the Filipino sound.
   */
  fil: {
    // B
    ba: { display: 'BA', ipa: '/ba/', guide: '"BA" as one sound: B + the open "ah", as in "mama"', spoken: { text: 'bah', locale: 'en-US' }, alternatives: [{ text: 'baa', locale: 'en-US' }] },
    be: { display: 'BE', ipa: '/bɛ/', guide: '"BE" as one sound: B + the short "eh", as in "bed"', spoken: { text: 'beh', locale: 'en-US' }, alternatives: [{ text: 'behh', locale: 'en-US' }] },
    bi: { display: 'BI', ipa: '/bi/', guide: '"BI" as one sound: B + "ee", as in "see"', spoken: { text: 'bee', locale: 'en-US' }, alternatives: [{ text: 'bea', locale: 'en-US' }] },
    bo: { display: 'BO', ipa: '/bo/', guide: '"BO" as one sound: B + the pure "oh", as in "oh"', spoken: { text: 'boh', locale: 'en-US' }, alternatives: [{ text: 'beau', locale: 'en-US' }, { text: 'bow', locale: 'en-US' }] },
    bu: { display: 'BU', ipa: '/bu/', guide: '"BU" as one sound: B + "oo", as in "boot"', spoken: { text: 'boo', locale: 'en-US' }, alternatives: [{ text: 'booh', locale: 'en-US' }] },
    // M
    ma: { display: 'MA', ipa: '/ma/', guide: '"MA" as one sound: M + the open "ah", as in "mama"', spoken: { text: 'mah', locale: 'en-US' }, alternatives: [{ text: 'maa', locale: 'en-US' }] },
    me: { display: 'ME', ipa: '/mɛ/', guide: '"ME" as one sound: M + the short "eh", as in "bed"', spoken: { text: 'meh', locale: 'en-US' }, alternatives: [{ text: 'mehh', locale: 'en-US' }] },
    mi: { display: 'MI', ipa: '/mi/', guide: '"MI" as one sound: M + "ee", as in "see"', spoken: { text: 'mee', locale: 'en-US' }, alternatives: [{ text: 'me', locale: 'en-US' }] },
    mo: { display: 'MO', ipa: '/mo/', guide: '"MO" as one sound: M + the pure "oh", as in "oh"', spoken: { text: 'moh', locale: 'en-US' }, alternatives: [{ text: 'mow', locale: 'en-US' }] },
    mu: { display: 'MU', ipa: '/mu/', guide: '"MU" as one sound: M + "oo", as in "boot"', spoken: { text: 'moo', locale: 'en-US' }, alternatives: [{ text: 'mooh', locale: 'en-US' }] },
    // P
    pa: { display: 'PA', ipa: '/pa/', guide: '"PA" as one sound: P + the open "ah", as in "mama"', spoken: { text: 'pah', locale: 'en-US' }, alternatives: [{ text: 'paa', locale: 'en-US' }] },
    pe: { display: 'PE', ipa: '/pɛ/', guide: '"PE" as one sound: P + the short "eh", as in "bed"', spoken: { text: 'peh', locale: 'en-US' }, alternatives: [{ text: 'pehh', locale: 'en-US' }] },
    pi: { display: 'PI', ipa: '/pi/', guide: '"PI" as one sound: P + "ee", as in "see"', spoken: { text: 'pee', locale: 'en-US' }, alternatives: [{ text: 'pea', locale: 'en-US' }] },
    po: { display: 'PO', ipa: '/po/', guide: '"PO" as one sound: P + the pure "oh", as in "oh"', spoken: { text: 'poh', locale: 'en-US' }, alternatives: [{ text: 'Poe', locale: 'en-US' }] },
    pu: { display: 'PU', ipa: '/pu/', guide: '"PU" as one sound: P + "oo", as in "boot"', spoken: { text: 'poo', locale: 'en-US' }, alternatives: [{ text: 'pooh', locale: 'en-US' }] },
    // T
    ta: { display: 'TA', ipa: '/ta/', guide: '"TA" as one sound: T + the open "ah", as in "mama"', spoken: { text: 'tah', locale: 'en-US' }, alternatives: [{ text: 'taa', locale: 'en-US' }] },
    te: { display: 'TE', ipa: '/tɛ/', guide: '"TE" as one sound: T + the short "eh", as in "bed"', spoken: { text: 'teh', locale: 'en-US' }, alternatives: [{ text: 'tehh', locale: 'en-US' }] },
    ti: { display: 'TI', ipa: '/ti/', guide: '"TI" as one sound: T + "ee", as in "see"', spoken: { text: 'tee', locale: 'en-US' }, alternatives: [{ text: 'tea', locale: 'en-US' }] },
    to: { display: 'TO', ipa: '/to/', guide: '"TO" as one sound: T + the pure "oh", as in "oh"', spoken: { text: 'toh', locale: 'en-US' }, alternatives: [{ text: 'toe', locale: 'en-US' }] },
    tu: { display: 'TU', ipa: '/tu/', guide: '"TU" as one sound: T + "oo", as in "boot"', spoken: { text: 'too', locale: 'en-US' }, alternatives: [{ text: 'two', locale: 'en-US' }] },
    // D
    da: { display: 'DA', ipa: '/da/', guide: '"DA" as one sound: D + the open "ah", as in "mama"', spoken: { text: 'dah', locale: 'en-US' }, alternatives: [{ text: 'daa', locale: 'en-US' }] },
    de: { display: 'DE', ipa: '/dɛ/', guide: '"DE" as one sound: D + the short "eh", as in "bed"', spoken: { text: 'deh', locale: 'en-US' }, alternatives: [{ text: 'dehh', locale: 'en-US' }] },
    di: { display: 'DI', ipa: '/di/', guide: '"DI" as one sound: D + "ee", as in "see"', spoken: { text: 'dee', locale: 'en-US' }, alternatives: [{ text: 'deeh', locale: 'en-US' }] },
    do: { display: 'DO', ipa: '/do/', guide: '"DO" as one sound: D + the pure "oh", as in "oh"', spoken: { text: 'doh', locale: 'en-US' }, alternatives: [{ text: 'dough', locale: 'en-US' }] },
    du: { display: 'DU', ipa: '/du/', guide: '"DU" as one sound: D + "oo", as in "boot"', spoken: { text: 'doo', locale: 'en-US' }, alternatives: [{ text: 'dew', locale: 'en-US' }] },
    // K
    ka: { display: 'KA', ipa: '/ka/', guide: '"KA" as one sound: K + the open "ah", as in "mama"', spoken: { text: 'kah', locale: 'en-US' }, alternatives: [{ text: 'kaa', locale: 'en-US' }] },
    ke: { display: 'KE', ipa: '/kɛ/', guide: '"KE" as one sound: K + the short "eh", as in "bed"', spoken: { text: 'keh', locale: 'en-US' }, alternatives: [{ text: 'kehh', locale: 'en-US' }] },
    ki: { display: 'KI', ipa: '/ki/', guide: '"KI" as one sound: K + "ee", as in "see"', spoken: { text: 'kee', locale: 'en-US' }, alternatives: [{ text: 'key', locale: 'en-US' }] },
    ko: { display: 'KO', ipa: '/ko/', guide: '"KO" as one sound: K + the pure "oh", as in "oh"', spoken: { text: 'koh', locale: 'en-US' }, alternatives: [{ text: 'co', locale: 'en-US' }] },
    ku: { display: 'KU', ipa: '/ku/', guide: '"KU" as one sound: K + "oo", as in "boot"', spoken: { text: 'koo', locale: 'en-US' }, alternatives: [{ text: 'coo', locale: 'en-US' }] },
    // G
    ga: { display: 'GA', ipa: '/ɡa/', guide: '"GA" as one sound: G + the open "ah", as in "mama"', spoken: { text: 'gah', locale: 'en-US' }, alternatives: [{ text: 'gaa', locale: 'en-US' }] },
    ge: { display: 'GE', ipa: '/ɡɛ/', guide: '"GE" as one sound: G + the short "eh", as in "bed"', spoken: { text: 'gheh', locale: 'en-US' }, alternatives: [{ text: 'gueh', locale: 'en-US' }] },
    gi: { display: 'GI', ipa: '/ɡi/', guide: '"GI" as one sound: G + "ee", as in "see"', spoken: { text: 'ghee', locale: 'en-US' }, alternatives: [{ text: 'guee', locale: 'en-US' }] },
    go: { display: 'GO', ipa: '/ɡo/', guide: '"GO" as one sound: G + the pure "oh", as in "oh"', spoken: { text: 'goh', locale: 'en-US' }, alternatives: [{ text: 'go', locale: 'en-US' }] },
    gu: { display: 'GU', ipa: '/ɡu/', guide: '"GU" as one sound: G + "oo", as in "boot"', spoken: { text: 'goo', locale: 'en-US' }, alternatives: [{ text: 'gooh', locale: 'en-US' }] },
    // S
    sa: { display: 'SA', ipa: '/sa/', guide: '"SA" as one sound: S + the open "ah", as in "mama"', spoken: { text: 'sah', locale: 'en-US' }, alternatives: [{ text: 'saa', locale: 'en-US' }] },
    se: { display: 'SE', ipa: '/sɛ/', guide: '"SE" as one sound: S + the short "eh", as in "bed"', spoken: { text: 'seh', locale: 'en-US' }, alternatives: [{ text: 'sehh', locale: 'en-US' }] },
    si: { display: 'SI', ipa: '/si/', guide: '"SI" as one sound: S + "ee", as in "see"', spoken: { text: 'see', locale: 'en-US' }, alternatives: [{ text: 'sea', locale: 'en-US' }] },
    so: { display: 'SO', ipa: '/so/', guide: '"SO" as one sound: S + the pure "oh", as in "oh"', spoken: { text: 'soh', locale: 'en-US' }, alternatives: [{ text: 'sew', locale: 'en-US' }] },
    su: { display: 'SU', ipa: '/su/', guide: '"SU" as one sound: S + "oo", as in "boot"', spoken: { text: 'soo', locale: 'en-US' }, alternatives: [{ text: 'sue', locale: 'en-US' }] },
    // N
    na: { display: 'NA', ipa: '/na/', guide: '"NA" as one sound: N + the open "ah", as in "mama"', spoken: { text: 'nah', locale: 'en-US' }, alternatives: [{ text: 'naa', locale: 'en-US' }] },
    ne: { display: 'NE', ipa: '/nɛ/', guide: '"NE" as one sound: N + the short "eh", as in "bed"', spoken: { text: 'neh', locale: 'en-US' }, alternatives: [{ text: 'nehh', locale: 'en-US' }] },
    ni: { display: 'NI', ipa: '/ni/', guide: '"NI" as one sound: N + "ee", as in "see"', spoken: { text: 'nee', locale: 'en-US' }, alternatives: [{ text: 'knee', locale: 'en-US' }] },
    no: { display: 'NO', ipa: '/no/', guide: '"NO" as one sound: N + the pure "oh", as in "oh"', spoken: { text: 'noh', locale: 'en-US' }, alternatives: [{ text: 'no', locale: 'en-US' }] },
    nu: { display: 'NU', ipa: '/nu/', guide: '"NU" as one sound: N + "oo", as in "boot"', spoken: { text: 'noo', locale: 'en-US' }, alternatives: [{ text: 'gnu', locale: 'en-US' }] },
    // F
    fa: { display: 'FA', ipa: '/fa/', guide: '"FA" as one sound: F + the open "ah", as in "mama"', spoken: { text: 'fah', locale: 'en-US' }, alternatives: [{ text: 'faa', locale: 'en-US' }] },
    fe: { display: 'FE', ipa: '/fɛ/', guide: '"FE" as one sound: F + the short "eh", as in "bed"', spoken: { text: 'feh', locale: 'en-US' }, alternatives: [{ text: 'fehh', locale: 'en-US' }] },
    fi: { display: 'FI', ipa: '/fi/', guide: '"FI" as one sound: F + "ee", as in "see"', spoken: { text: 'fee', locale: 'en-US' }, alternatives: [{ text: 'feeh', locale: 'en-US' }] },
    fo: { display: 'FO', ipa: '/fo/', guide: '"FO" as one sound: F + the pure "oh", as in "oh"', spoken: { text: 'foh', locale: 'en-US' }, alternatives: [{ text: 'faux', locale: 'en-US' }] },
    fu: { display: 'FU', ipa: '/fu/', guide: '"FU" as one sound: F + "oo", as in "boot"', spoken: { text: 'foo', locale: 'en-US' }, alternatives: [{ text: 'fooh', locale: 'en-US' }] },
  },
};

/**
 * Words, phrases and sentences are real language, so the engine normally reads the display text
 * itself (displayText === spokenText). Add an entry here, keyed by model key ("word:v-ball",
 * "phrase:ph-water"), only for a target a voice engine is known to misread.
 */
export const SPOKEN_OVERRIDES: Record<string, SpokenForm> = {};

/** The dictionary entry for a syllable id ("bo") in a set, or undefined. */
export function syllablePronunciation(set: PronunciationSet, id: string): PronunciationEntry | undefined {
  return SYLLABLE_PRONUNCIATIONS[set][id.toLowerCase()];
}
