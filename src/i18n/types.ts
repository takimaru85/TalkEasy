/**
 * Localization types.
 *
 * TalkEasy ships US English as the default and treats every other language as an addition:
 * a locale file supplies UI strings, a translation map for the English content seeded into
 * SQLite, a BCP-47 tag for speech, and the letterform style used on handwriting surfaces.
 *
 * To add a language (Spanish, Japanese, Korean…): copy src/i18n/locales/en.ts, translate the
 * values, and register it in src/i18n/index.ts. TypeScript enforces that every key is present.
 */

/** Registered locales. Add a code here when you add a locale file. */
export type LocaleCode = 'en-US' | 'fil-PH';

/**
 * Which lowercase "a" the handwriting surfaces draw.
 * - 'standard': the ordinary double-storey "a" (US English and most languages).
 * - 'single-storey': the Filipino elementary-school print form taught for reading and writing.
 */
export type LetterStyle = 'standard' | 'single-storey';

/**
 * Child-facing UI text. Parent Mode stays in English for now — it is the grown-up's screen and
 * translating it is a separate pass (see docs/ARCHITECTURE.md).
 */
export interface Strings {
  // Home
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  statusAllDone: string;
  statusWeekend: string;
  statusBeforeSchool: string;
  statusSchoolDay: string;
  statusAfternoon: string;
  statusEvening: string;
  todaysPlan: string;
  nowLabel: string;
  nextLabel: string;
  favouritePhrases: string;
  continueLearning: string;
  continueLabel: string;
  startLabel: string;
  myStars: string;

  // Sections / screen titles
  sectionTalk: string;
  sectionLessons: string;
  sectionSchool: string;
  sectionLearn: string;
  sectionMyDay: string;
  sectionActivities: string;
  sectionFavorites: string;
  sectionFeelings: string;
  sectionParent: string;
  titleWritingPractice: string;
  titleWriting: string;
  titleSpeakAnswer: string;
  titleSubjects: string;
  titleLesson: string;

  // Shared actions
  actionHome: string;
  actionBack: string;
  actionDone: string;
  actionNext: string;
  actionTryAgain: string;
  actionHearAgain: string;
  actionDoneForNow: string;
  actionNextQuestion: string;

  // Answering
  answerRecorded: string;
  answerNotQuite: string;
  answerLabel: string;
  cannotWriteThis: string;
  greatJob: string;
  letsTryAgain: string;
  tapToSpeak: string;
  listening: string;

  // Sound Practice
  sectionSoundPractice: string;
  soundPracticeSubtitle: string;
  soundChooseSound: string;
  soundPracticeCta: string;
  soundListen: string;
  soundPlaySound: string;
  soundYourTurn: string;
  soundTapToSpeak: string;
  soundStopRecording: string;
  soundRecording: string;
  soundHearYourself: string;
  soundGreatTry: string;
  soundNiceJob: string;
  soundTryItAgain: string;
  soundKeepPracticing: string;
  soundTryAgain: string;
  soundNext: string;
  soundTodaysPractice: string;
  soundStatSounds: string;
  soundStatAttempts: string;
  soundStatTime: string;
  soundLikeWord: string;
  soundMicTitle: string;
  soundMicExplain: string;
  soundMicAllow: string;
  soundMicNotNow: string;
  soundMicOff: string;
  soundForGrownUps: string;
  soundGrownUpNote: string;
  soundNotTherapy: string;
  soundModelIsSynthetic: string;
}

/** The English text seeded into SQLite, mapped to this language. Missing keys pass through. */
export type ContentMap = Record<string, string>;

export interface Locale {
  code: LocaleCode;
  /** Shown in the language selector, in the language itself. */
  name: string;
  flag: string;
  /** BCP-47 tag handed to text-to-speech and speech recognition. */
  speechTag: string;
  letterStyle: LetterStyle;
  strings: Strings;
  content: ContentMap;
}
