import type {
  PracticeActivityDef,
  PracticeAreaDef,
  PracticeAreaId,
  PracticeExercise,
  VoiceLine,
} from './types';
import { getSoundExercise } from '@/soundpractice/content';

/**
 * Voice & Communication content — original TalkEasy material.
 *
 * Every sentence, conversation and choice here was written for this app. The section is INSPIRED
 * by the interactional view of children's intonation — that a voice does jobs in a conversation
 * (taking a turn, marking what matters, answering somebody) rather than merely sounding right —
 * but no wording, example, activity, form or table is reproduced from any source. The concepts are
 * not ownable; the words are, so these are ours.
 *
 * The practice sentences are deliberately plain English kept as DATA (like src/learning/content),
 * not as UI strings: they are the thing being practised rather than interface text, and the app's
 * voice says them in the child's chosen English accent.
 *
 * Content rules, enforced by check:voice:
 *  - no sentence claims a pitch pattern is the correct one for a sentence type;
 *  - no choice claims a pitch pattern means one fixed feeling;
 *  - nothing suggests a disorder, delay, norm, score or assessment.
 */

const line = (id: string, text: string, extra: Partial<VoiceLine> = {}): VoiceLine => ({ id, text, ...extra });

// ------------------------------------------------------------------------------ the six areas
export const PRACTICE_AREAS: PracticeAreaDef[] = [
  // Listening and understanding come FIRST, deliberately. The developmental sequence these
  // activities follow puts looking, listening and understanding before talking, and a child who
  // opens this screen should meet something they can already succeed at without speaking.
  { id: 'attention', emoji: '👂', icon: 'ear-hearing', titleKey: 'vcAttention', subtitleKey: 'vcAttentionSub', purpose: 'listening' },
  { id: 'early', emoji: '👀', icon: 'eye-plus-outline', titleKey: 'vcEarly', subtitleKey: 'vcEarlySub', purpose: 'communication' },
  { id: 'sounds', emoji: '🔤', icon: 'alphabetical-variant', titleKey: 'vcSounds', subtitleKey: 'vcSoundsSub', purpose: 'practice', ownedElsewhere: true },
  { id: 'understanding', emoji: '🧠', icon: 'lightbulb-on-outline', titleKey: 'vcUnderstanding', subtitleKey: 'vcUnderstandingSub', purpose: 'listening' },
  { id: 'expressive', emoji: '🗣️', icon: 'comment-text-outline', titleKey: 'vcExpressive', subtitleKey: 'vcExpressiveSub', purpose: 'communication' },
  { id: 'intonation', emoji: '🎵', icon: 'music-note-eighth', titleKey: 'vcIntonation', subtitleKey: 'vcIntonationSub', purpose: 'expression' },
  { id: 'listening', emoji: '👂', icon: 'ear-hearing', titleKey: 'vcListening', subtitleKey: 'vcListeningSub', purpose: 'listening' },
  { id: 'turns', emoji: '🚦', icon: 'traffic-light', titleKey: 'vcTurns', subtitleKey: 'vcTurnsSub', purpose: 'communication' },
  { id: 'focus', emoji: '🎯', icon: 'target', titleKey: 'vcFocus', subtitleKey: 'vcFocusSub', purpose: 'attention' },
  { id: 'conversation', emoji: '💬', icon: 'message-text-outline', titleKey: 'vcConversation', subtitleKey: 'vcConversationSub', purpose: 'communication' },
  { id: 'expression', emoji: '🎭', icon: 'drama-masks', titleKey: 'vcExpression', subtitleKey: 'vcExpressionSub', purpose: 'expression' },
];

export const PRACTICE_ACTIVITIES: PracticeActivityDef[] = [
  // 👂 Listen & Attention — the skills that come before talking. Not one of these needs a voice.
  { id: 'readySteadyGo', category: 'attention', emoji: '🚀', icon: 'rocket-launch-outline', titleKey: 'vcReadyGo', subtitleKey: 'vcReadyGoSub', level: 'beginner' },
  { id: 'beatCopy', category: 'attention', emoji: '👏', icon: 'hand-clap', titleKey: 'vcBeatCopy', subtitleKey: 'vcBeatCopySub', level: 'beginner' },
  { id: 'soundSame', category: 'attention', emoji: '⚖️', icon: 'approximately-equal', titleKey: 'vcSoundSame', subtitleKey: 'vcSoundSameSub', level: 'beginner' },
  { id: 'listenMemory', category: 'attention', emoji: '🧺', icon: 'basket-outline', titleKey: 'vcListenMemory', subtitleKey: 'vcListenMemorySub', level: 'intermediate' },
  { id: 'heardWord', category: 'attention', emoji: '🔎', icon: 'magnify', titleKey: 'vcHeardWord', subtitleKey: 'vcHeardWordSub', level: 'intermediate' },

  // 👀 Early Communication — joining in, before any words. Nothing here needs a voice.
  { id: 'copyMe', category: 'early', emoji: '🙌', icon: 'hand-wave-outline', titleKey: 'vcCopyMe', subtitleKey: 'vcCopyMeSub', level: 'beginner' },
  { id: 'lookFind', category: 'early', emoji: '👉', icon: 'gesture-tap', titleKey: 'vcLookFind', subtitleKey: 'vcLookFindSub', level: 'beginner' },
  { id: 'finishIt', category: 'early', emoji: '⏳', icon: 'dots-horizontal', titleKey: 'vcFinishIt', subtitleKey: 'vcFinishItSub', level: 'beginner' },
  { id: 'takeTurnsAction', category: 'early', emoji: '🔄', icon: 'swap-horizontal', titleKey: 'vcTurnsAction', subtitleKey: 'vcTurnsActionSub', level: 'intermediate' },

  // 🔤 Speech Sounds — the ladder. Listening comes first, and each rung builds on the one below.
  { id: 'soundListen', category: 'sounds', emoji: '👂', icon: 'ear-hearing', titleKey: 'vcSoundListen', subtitleKey: 'vcSoundListenSub', level: 'beginner' },
  { id: 'soundSay', category: 'sounds', emoji: '👄', icon: 'waveform', titleKey: 'vcSoundSay', subtitleKey: 'vcSoundSaySub', level: 'beginner' },
  { id: 'soundSyllable', category: 'sounds', emoji: '🔡', icon: 'format-letter-case', titleKey: 'vcSoundSyllable', subtitleKey: 'vcSoundSyllableSub', level: 'beginner' },
  { id: 'soundWord', category: 'sounds', emoji: '🍎', icon: 'text-short', titleKey: 'vcSoundWord', subtitleKey: 'vcSoundWordSub', level: 'intermediate' },
  { id: 'soundPhrase', category: 'sounds', emoji: '🧩', icon: 'text', titleKey: 'vcSoundPhrase', subtitleKey: 'vcSoundPhraseSub', level: 'intermediate' },
  { id: 'soundSentence', category: 'sounds', emoji: '📝', icon: 'text-long', titleKey: 'vcSoundSentence', subtitleKey: 'vcSoundSentenceSub', level: 'advanced' },
  { id: 'soundChat', category: 'sounds', emoji: '💬', icon: 'message-text-outline', titleKey: 'vcSoundChat', subtitleKey: 'vcSoundChatSub', level: 'advanced' },

  // 🗣️ Talking & Language — say as much as you can, and build it up.
  { id: 'sayMore', category: 'expressive', emoji: '🖼️', icon: 'image-outline', titleKey: 'vcSayMore', subtitleKey: 'vcSayMoreSub', level: 'beginner' },
  { id: 'buildSentence', category: 'expressive', emoji: '🧱', icon: 'sort-variant', titleKey: 'vcBuildSentence', subtitleKey: 'vcBuildSentenceSub', level: 'intermediate' },
  { id: 'describeIt', category: 'expressive', emoji: '🔍', icon: 'magnify-plus-outline', titleKey: 'vcDescribeIt', subtitleKey: 'vcDescribeItSub', level: 'intermediate' },
  { id: 'tellWhat', category: 'expressive', emoji: '❓', icon: 'comment-question-outline', titleKey: 'vcTellWhat', subtitleKey: 'vcTellWhatSub', level: 'advanced' },

  // 🧠 Understanding — following what was said. Tapping only; nothing here asks a child to speak.
  { id: 'findIt', category: 'understanding', emoji: '👀', icon: 'eye-outline', titleKey: 'vcFindIt', subtitleKey: 'vcFindItSub', level: 'beginner' },
  { id: 'oneStep', category: 'understanding', emoji: '1️⃣', icon: 'numeric-1-circle-outline', titleKey: 'vcOneStep', subtitleKey: 'vcOneStepSub', level: 'beginner' },
  { id: 'twoStep', category: 'understanding', emoji: '2️⃣', icon: 'numeric-2-circle-outline', titleKey: 'vcTwoStep', subtitleKey: 'vcTwoStepSub', level: 'intermediate' },
  { id: 'whichOne', category: 'understanding', emoji: '🎨', icon: 'palette-outline', titleKey: 'vcWhichOne', subtitleKey: 'vcWhichOneSub', level: 'intermediate' },
  // 🎵 Voice & Intonation
  { id: 'highLow', category: 'intonation', emoji: '⬆️', icon: 'arrow-up-down', titleKey: 'vcHighLow', subtitleKey: 'vcHighLowSub', level: 'beginner' },
  { id: 'rising', category: 'intonation', emoji: '↗️', icon: 'trending-up', titleKey: 'vcRising', subtitleKey: 'vcRisingSub', level: 'beginner' },
  { id: 'falling', category: 'intonation', emoji: '↘️', icon: 'trending-down', titleKey: 'vcFalling', subtitleKey: 'vcFallingSub', level: 'beginner' },
  { id: 'loudSoft', category: 'intonation', emoji: '🔊', icon: 'volume-high', titleKey: 'vcLoudSoft', subtitleKey: 'vcLoudSoftSub', level: 'beginner' },
  { id: 'fastSlow', category: 'intonation', emoji: '🐢', icon: 'speedometer', titleKey: 'vcFastSlow', subtitleKey: 'vcFastSlowSub', level: 'beginner' },
  { id: 'strongWord', category: 'intonation', emoji: '💪', icon: 'format-bold', titleKey: 'vcStrongWord', subtitleKey: 'vcStrongWordSub', level: 'intermediate' },
  { id: 'copyVoice', category: 'intonation', emoji: '🪞', icon: 'mirror', titleKey: 'vcCopyVoice', subtitleKey: 'vcCopyVoiceSub', level: 'intermediate' },

  // 👂 Listening
  { id: 'sameDifferent', category: 'listening', emoji: '⚖️', icon: 'approximately-equal', titleKey: 'vcSameDifferent', subtitleKey: 'vcSameDifferentSub', level: 'beginner' },
  { id: 'questionStatement', category: 'listening', emoji: '❓', icon: 'help-circle-outline', titleKey: 'vcQuestionStatement', subtitleKey: 'vcQuestionStatementSub', level: 'intermediate' },
  { id: 'whichWord', category: 'listening', emoji: '🔍', icon: 'magnify', titleKey: 'vcWhichWord', subtitleKey: 'vcWhichWordSub', level: 'intermediate' },
  { id: 'whatDidYouHear', category: 'listening', emoji: '👂', icon: 'ear-hearing', titleKey: 'vcWhatDidYouHear', subtitleKey: 'vcWhatDidYouHearSub', level: 'advanced' },

  // 🚦 Turn-Taking
  { id: 'myTurnYourTurn', category: 'turns', emoji: '🔁', icon: 'swap-horizontal', titleKey: 'vcMyTurn', subtitleKey: 'vcMyTurnSub', level: 'beginner' },
  { id: 'waitTurn', category: 'turns', emoji: '⏳', icon: 'timer-sand', titleKey: 'vcWaitTurn', subtitleKey: 'vcWaitTurnSub', level: 'beginner' },
  { id: 'whenCanISpeak', category: 'turns', emoji: '🚦', icon: 'traffic-light', titleKey: 'vcWhenSpeak', subtitleKey: 'vcWhenSpeakSub', level: 'intermediate' },
  { id: 'keepTurn', category: 'turns', emoji: '🎤', icon: 'microphone-variant', titleKey: 'vcKeepTurn', subtitleKey: 'vcKeepTurnSub', level: 'advanced' },

  // 🎯 Focus
  { id: 'importantWord', category: 'focus', emoji: '⭐', icon: 'star-outline', titleKey: 'vcImportantWord', subtitleKey: 'vcImportantWordSub', level: 'intermediate' },
  { id: 'changeMeaning', category: 'focus', emoji: '🔀', icon: 'shuffle-variant', titleKey: 'vcChangeMeaning', subtitleKey: 'vcChangeMeaningSub', level: 'advanced' },
  { id: 'listenFocus', category: 'focus', emoji: '🎧', icon: 'headphones', titleKey: 'vcListenFocus', subtitleKey: 'vcListenFocusSub', level: 'intermediate' },

  // 💬 Conversation
  { id: 'respond', category: 'conversation', emoji: '💬', icon: 'message-reply-outline', titleKey: 'vcRespond', subtitleKey: 'vcRespondSub', level: 'beginner' },
  { id: 'agree', category: 'conversation', emoji: '👍', icon: 'thumb-up-outline', titleKey: 'vcAgree', subtitleKey: 'vcAgreeSub', level: 'beginner' },
  { id: 'ask', category: 'conversation', emoji: '🙋', icon: 'hand-back-right-outline', titleKey: 'vcAsk', subtitleKey: 'vcAskSub', level: 'intermediate' },
  { id: 'answer', category: 'conversation', emoji: '✅', icon: 'check-circle-outline', titleKey: 'vcAnswer', subtitleKey: 'vcAnswerSub', level: 'intermediate' },
  { id: 'startTalking', category: 'conversation', emoji: '🌟', icon: 'star-shooting-outline', titleKey: 'vcStartTalking', subtitleKey: 'vcStartTalkingSub', level: 'advanced' },

  // 🎭 Expression
  { id: 'surprise', category: 'expression', emoji: '😮', icon: 'emoticon-excited-outline', titleKey: 'vcSurprise', subtitleKey: 'vcSurpriseSub', level: 'beginner' },
  { id: 'excitement', category: 'expression', emoji: '🎉', icon: 'party-popper', titleKey: 'vcExcitement', subtitleKey: 'vcExcitementSub', level: 'beginner' },
  { id: 'questioning', category: 'expression', emoji: '🤔', icon: 'help-rhombus-outline', titleKey: 'vcQuestioning', subtitleKey: 'vcQuestioningSub', level: 'intermediate' },
  { id: 'confirming', category: 'expression', emoji: '🙂', icon: 'emoticon-outline', titleKey: 'vcConfirming', subtitleKey: 'vcConfirmingSub', level: 'intermediate' },
  { id: 'friendly', category: 'expression', emoji: '🤝', icon: 'hand-heart-outline', titleKey: 'vcFriendly', subtitleKey: 'vcFriendlySub', level: 'advanced' },
];

// ------------------------------------------------------------------------------ shared choices
const RISE_FALL = [
  { id: 'rise', labelKey: 'vcChoiceUp' as const, shape: 'rise' as const },
  { id: 'fall', labelKey: 'vcChoiceDown' as const, shape: 'fall' as const },
];
const SAME_DIFFERENT = [
  { id: 'same', labelKey: 'vcChoiceSame' as const, picture: '🟰' },
  { id: 'different', labelKey: 'vcChoiceDifferent' as const, picture: '↔️' },
];

/**
 * Two readings of one sentence, differing only in the voice.
 *
 * Both readings carry the same words on purpose: the child is hearing the VOICE, and a pair that
 * also changed the words would let them answer without listening to it.
 */
function pair(id: string, text: string, a: VoiceLine['shape'], b: VoiceLine['shape']): VoiceLine[] {
  return [line(`${id}-a`, text, { shape: a }), line(`${id}-b`, text, { shape: b })];
}

// ------------------------------------------------------------------------------ the exercises
/**
 * Every activity's exercises. Data only — the engine adds nothing but order, so what is written
 * here is exactly what a child meets.
 */
/**
 * An isolated sound: shows its letter, and its model is the PHONEME from soundpractice/content
 * (played by soundPracticeAudio.playPhoneme) — never the letter name ("gee") and never a
 * respelling ("guh", which is /ɡə/ — a consonant plus a vowel).
 */
const letterOf = (soundId: string) => getSoundExercise(soundId)?.letter ?? soundId.toUpperCase();

/** Two sounds to compare (soundpractice ids). Same-sounding pairs are chosen to be genuinely tellable apart by ear. */
const soundPair = (id: string, a: string, b: string) => [
  line(`${id}-1`, letterOf(a), { soundId: a }),
  line(`${id}-2`, letterOf(b), { soundId: b }),
];

/** A picture choice labelled with practice content rather than an interface word. */
const pick = (id: string, text: string, picture: string) => ({ id, text, picture });

/** One rung of a say-more ladder. */
const rung = (id: string, text: string) => line(id, text);

/**
 * A sound's ladder, from hearing it to using it in a conversation.
 *
 * Built from a target sound, an example word and a phrase, so a new sound is one entry rather than
 * seven activities. The order is the whole point: listening before saying, sound before syllable,
 * syllable before word, word before sentence. A child is never dropped straight into the top rung.
 */
interface SoundLadder {
  /** The target sound — a soundpractice/content id, which defines its letter and phoneme. */
  id: string;
  /** A sound (also a soundpractice/content id) it is genuinely tellable apart from, for the listening rung. */
  contrast: string;
  syllable: string;
  word: string;
  wordPicture: string;
  phrase: string;
  sentence: string;
}

const LADDERS: SoundLadder[] = [
  { id: 'm', contrast: 's', syllable: 'mah', word: 'moon', wordPicture: '🌙', phrase: 'my moon', sentence: 'I can see the moon.' },
  { id: 'b', contrast: 'f', syllable: 'bah', word: 'ball', wordPicture: '⚽', phrase: 'big ball', sentence: 'The ball is big.' },
  { id: 'p', contrast: 'm', syllable: 'pah', word: 'pig', wordPicture: '🐷', phrase: 'pink pig', sentence: 'The pig is pink.' },
  { id: 's', contrast: 'b', syllable: 'sah', word: 'sun', wordPicture: '☀️', phrase: 'sunny sky', sentence: 'The sun is up.' },
  { id: 't', contrast: 'n', syllable: 'tah', word: 'toy', wordPicture: '🧸', phrase: 'my toy', sentence: 'I want my toy.' },
];

/** The listening rung: which of two sounds was that? Hearing the difference comes first. */
const ladderListen = () =>
  LADDERS.map((l) => ({
    kind: 'listen-choose' as const,
    id: `sl-${l.id}`,
    promptKey: 'vcPromptWhichSound' as const,
    listen: [line(`sl-${l.id}`, letterOf(l.id), { soundId: l.id })],
    choices: [
      { id: l.id, text: letterOf(l.id), picture: '🔊' },
      { id: `${l.id}-x`, text: letterOf(l.contrast), picture: '🔊' },
    ],
    answerIds: [l.id],
  }));

/** Every other rung is "hear it, then have a go" — the voice is always optional. */
const ladderSay = (pick: (l: SoundLadder) => { text: string; picture?: string; speak?: string; soundId?: string }, cueKey: 'vcCueSaySound' | 'vcCueSayWord') =>
  LADDERS.map((l) => {
    const item = pick(l);
    return {
      kind: 'voice-try' as const,
      id: `${cueKey}-${l.id}-${item.text}`,
      line: line(`${l.id}-${item.text}`, item.text, { speak: item.speak, picture: item.picture, soundId: item.soundId }),
      cueKey,
      optionalVoice: true as const,
    };
  });

export const PRACTICE_CONTENT: Record<string, PracticeExercise[]> = {
  // ---------------------------------------------------------------- 👀 Early Communication
  copyMe: [
    { kind: 'copy-action', id: 'cm-clap', line: line('cm-clap', 'Clap your hands!'), picture: '👏', gentlerKey: 'vcOrJustWatch' },
    { kind: 'copy-action', id: 'cm-wave', line: line('cm-wave', 'Wave hello!'), picture: '👋', gentlerKey: 'vcOrJustWatch' },
    { kind: 'copy-action', id: 'cm-stamp', line: line('cm-stamp', 'Stamp your feet!'), picture: '🦶', gentlerKey: 'vcOrJustWatch' },
    { kind: 'copy-action', id: 'cm-arms', line: line('cm-arms', 'Arms up high!'), picture: '🙌', gentlerKey: 'vcOrJustWatch' },
    { kind: 'copy-action', id: 'cm-blow', line: line('cm-blow', 'Blow a big breath!'), picture: '🌬️', gentlerKey: 'vcOrJustWatch' },
  ],

  lookFind: [
    {
      kind: 'listen-choose', id: 'lf-1', promptKey: 'vcPromptLook',
      listen: [line('lf1', 'Look! Where is the ball?')],
      choices: [pick('ball', 'ball', '⚽'), pick('cup', 'cup', '🥤')],
      answerIds: ['ball'],
    },
    {
      kind: 'listen-choose', id: 'lf-2', promptKey: 'vcPromptLook',
      listen: [line('lf2', 'Look! Where is the teddy?')],
      choices: [pick('car', 'car', '🚗'), pick('teddy', 'teddy', '🧸')],
      answerIds: ['teddy'],
    },
    {
      kind: 'listen-choose', id: 'lf-3', promptKey: 'vcPromptLook',
      listen: [line('lf3', 'Look! Where is the cat?')],
      choices: [pick('cat', 'cat', '🐱'), pick('shoe', 'shoe', '👟'), pick('hat', 'hat', '🧢')],
      answerIds: ['cat'],
    },
  ],

  // Anticipation: the app leaves a familiar phrase unfinished and waits.
  finishIt: [
    {
      kind: 'listen-choose', id: 'fn-1', promptKey: 'vcPromptFinishIt',
      listen: [line('fn1', 'Ready, steady...')],
      choices: [pick('go', 'go!', '🚀'), pick('stop', 'stop', '🛑'), pick('sleep', 'sleep', '😴')],
      answerIds: ['go'],
    },
    {
      kind: 'listen-choose', id: 'fn-2', promptKey: 'vcPromptFinishIt',
      listen: [line('fn2', 'One, two...')],
      choices: [pick('three', 'three', '3️⃣'), pick('ten', 'ten', '🔟'), pick('red', 'red', '🔴')],
      answerIds: ['three'],
    },
    {
      kind: 'listen-choose', id: 'fn-3', promptKey: 'vcPromptFinishIt',
      listen: [line('fn3', 'Up, up and...')],
      choices: [pick('away', 'away!', '✈️'), pick('down', 'down', '⬇️')],
      answerIds: ['away'],
    },
  ],

  takeTurnsAction: [
    {
      kind: 'exchange', id: 'tt-clap', titleKey: 'vcExchangeClap',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'My turn — clap!', { picture: '👏' }) },
        { id: 't2', who: 'child', line: line('c1', 'Your turn — clap!'), alternatives: [line('c1b', 'Your turn — wave!')] },
        { id: 't3', who: 'app', line: line('a2', 'My turn — stamp!', { picture: '🦶' }) },
        { id: 't4', who: 'child', line: line('c2', 'Your turn — stamp!') },
      ],
    },
    {
      kind: 'exchange', id: 'tt-roll', titleKey: 'vcExchangeRoll',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'I roll the ball to you.', { picture: '⚽' }) },
        { id: 't2', who: 'child', line: line('c1', 'I roll it back!') },
        { id: 't3', who: 'app', line: line('a2', 'Thank you! My turn again.') },
        { id: 't4', who: 'child', line: line('c2', 'Your turn!') },
      ],
    },
  ],

  // ---------------------------------------------------------------- 🔤 Speech Sounds (the ladder)
  soundListen: ladderListen(),
  soundSay: ladderSay((l) => ({ text: letterOf(l.id), soundId: l.id }), 'vcCueSaySound'),
  soundSyllable: ladderSay((l) => ({ text: l.syllable }), 'vcCueSaySound'),
  soundWord: ladderSay((l) => ({ text: l.word, picture: l.wordPicture }), 'vcCueSayWord'),
  soundPhrase: ladderSay((l) => ({ text: l.phrase, picture: l.wordPicture }), 'vcCueSayWord'),
  soundSentence: ladderSay((l) => ({ text: l.sentence, picture: l.wordPicture }), 'vcCueSayWord'),
  soundChat: LADDERS.slice(0, 3).map((l) => ({
    kind: 'exchange' as const,
    id: `sc-${l.id}`,
    titleKey: 'vcExchangeAboutIt' as const,
    turns: [
      { id: 't1', who: 'app' as const, line: line(`${l.id}-q`, `Can you see the ${l.word}?`, { picture: l.wordPicture }) },
      { id: 't2', who: 'child' as const, line: line(`${l.id}-a`, `Yes, the ${l.word}!`), alternatives: [line(`${l.id}-a2`, l.phrase)] },
      { id: 't3', who: 'app' as const, line: line(`${l.id}-f`, 'Tell me about it.') },
      { id: 't4', who: 'child' as const, line: line(`${l.id}-s`, l.sentence) },
    ],
  })),

  // ---------------------------------------------------------------- 🗣️ Talking & Language
  sayMore: [
    { kind: 'say-more', id: 'sm-dog', picture: '🐶', promptKey: 'vcPromptWhatHappening', rungs: [rung('r1', 'dog'), rung('r2', 'dog run'), rung('r3', 'The dog is running'), rung('r4', 'The dog is running fast')] },
    { kind: 'say-more', id: 'sm-eat', picture: '🍎', promptKey: 'vcPromptWhatHappening', rungs: [rung('r1', 'apple'), rung('r2', 'eat apple'), rung('r3', 'She is eating an apple')] },
    { kind: 'say-more', id: 'sm-car', picture: '🚗', promptKey: 'vcPromptWhatHappening', rungs: [rung('r1', 'car'), rung('r2', 'red car'), rung('r3', 'The red car is going'), rung('r4', 'The red car is going fast')] },
    { kind: 'say-more', id: 'sm-sleep', picture: '😴', promptKey: 'vcPromptWhatHappening', rungs: [rung('r1', 'sleep'), rung('r2', 'baby sleep'), rung('r3', 'The baby is sleeping')] },
  ],

  buildSentence: [
    { kind: 'arrange', id: 'bs-1', words: ['I', 'want', 'the', 'red', 'ball'], picture: '🔴', promptKey: 'vcPromptBuildIt' },
    { kind: 'arrange', id: 'bs-2', words: ['The', 'cat', 'is', 'sleeping'], picture: '🐱', promptKey: 'vcPromptBuildIt' },
    { kind: 'arrange', id: 'bs-3', words: ['We', 'are', 'going', 'home'], picture: '🏠', promptKey: 'vcPromptBuildIt' },
    { kind: 'arrange', id: 'bs-4', words: ['My', 'brother', 'has', 'a', 'bike'], picture: '🚲', promptKey: 'vcPromptBuildIt' },
  ],

  describeIt: [
    { kind: 'say-more', id: 'di-1', picture: '🍌', promptKey: 'vcPromptDescribe', rungs: [rung('r1', 'banana'), rung('r2', 'yellow banana'), rung('r3', 'It is a long yellow banana')] },
    { kind: 'say-more', id: 'di-2', picture: '🐘', promptKey: 'vcPromptDescribe', rungs: [rung('r1', 'elephant'), rung('r2', 'big elephant'), rung('r3', 'The elephant is big and grey')] },
    { kind: 'say-more', id: 'di-3', picture: '🎂', promptKey: 'vcPromptDescribe', rungs: [rung('r1', 'cake'), rung('r2', 'birthday cake'), rung('r3', 'It is a birthday cake with candles')] },
  ],

  tellWhat: [
    {
      kind: 'exchange', id: 'tw-day', titleKey: 'vcExchangeMyDay',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'What did you do today?') },
        { id: 't2', who: 'child', line: line('c1', 'I went to school.'), alternatives: [line('c1b', 'I played outside.'), line('c1c', 'I stayed at home.')] },
        { id: 't3', who: 'app', line: line('a2', 'What did you do there?') },
        { id: 't4', who: 'child', line: line('c2', 'I played with my friend.') },
      ],
    },
    {
      kind: 'exchange', id: 'tw-like', titleKey: 'vcExchangeFavourite',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'What do you like to eat?') },
        { id: 't2', who: 'child', line: line('c1', 'I like rice.'), alternatives: [line('c1b', 'I like bread.'), line('c1c', 'I like fruit.')] },
        { id: 't3', who: 'app', line: line('a2', 'Who cooks it for you?') },
        { id: 't4', who: 'child', line: line('c2', 'My mom cooks it.') },
      ],
    },
  ],

  // ---------------------------------------------------------------- 👂 Listen & Attention
  readySteadyGo: [
    { kind: 'wait-go', id: 'rsg-1', intro: line('rsg-1', 'The rocket is ready to fly!', { picture: '🚀' }), waits: [900, 1400, 2100] },
    { kind: 'wait-go', id: 'rsg-2', intro: line('rsg-2', 'The race car is on the line!', { picture: '🏎️' }), waits: [1200, 1900, 2800] },
    { kind: 'wait-go', id: 'rsg-3', intro: line('rsg-3', 'The runner is waiting to start!', { picture: '🏃' }), waits: [1500, 2400, 3400] },
  ],

  beatCopy: [
    { kind: 'beat', id: 'bc-1', beats: 2, gapMs: 750 },
    { kind: 'beat', id: 'bc-2', beats: 3, gapMs: 700 },
    { kind: 'beat', id: 'bc-3', beats: 2, gapMs: 520 },
    { kind: 'beat', id: 'bc-4', beats: 4, gapMs: 650 },
  ],

  // Hearing that two sounds differ comes BEFORE being asked to say either of them.
  soundSame: [
    { kind: 'listen-choose', id: 'ss-1', promptKey: 'vcPromptSameDifferent', listen: soundPair('ss1', 'm', 'm'), choices: SAME_DIFFERENT, answerIds: ['same'] },
    { kind: 'listen-choose', id: 'ss-2', promptKey: 'vcPromptSameDifferent', listen: soundPair('ss2', 'b', 's'), choices: SAME_DIFFERENT, answerIds: ['different'] },
    { kind: 'listen-choose', id: 'ss-3', promptKey: 'vcPromptSameDifferent', listen: soundPair('ss3', 'p', 'p'), choices: SAME_DIFFERENT, answerIds: ['same'] },
    { kind: 'listen-choose', id: 'ss-4', promptKey: 'vcPromptSameDifferent', listen: soundPair('ss4', 'm', 'n'), choices: SAME_DIFFERENT, answerIds: ['different'] },
    { kind: 'listen-choose', id: 'ss-5', promptKey: 'vcPromptSameDifferent', listen: soundPair('ss5', 'f', 's'), choices: SAME_DIFFERENT, answerIds: ['different'] },
  ],

  listenMemory: [
    {
      kind: 'listen-choose', id: 'lm-1', promptKey: 'vcPromptWhatDidYouHear', ordered: true,
      listen: [line('lm1a', 'cat'), line('lm1b', 'bus')],
      choices: [pick('cat', 'cat', '🐱'), pick('bus', 'bus', '🚌'), pick('cup', 'cup', '🥤')],
      answerIds: ['cat', 'bus'],
    },
    {
      kind: 'listen-choose', id: 'lm-2', promptKey: 'vcPromptWhatDidYouHear', ordered: true,
      listen: [line('lm2a', 'ball'), line('lm2b', 'dog')],
      choices: [pick('dog', 'dog', '🐶'), pick('ball', 'ball', '⚽'), pick('hat', 'hat', '🧢')],
      answerIds: ['ball', 'dog'],
    },
    {
      kind: 'listen-choose', id: 'lm-3', promptKey: 'vcPromptWhatDidYouHear', ordered: true,
      listen: [line('lm3a', 'apple'), line('lm3b', 'car'), line('lm3c', 'star')],
      choices: [pick('apple', 'apple', '🍎'), pick('car', 'car', '🚗'), pick('star', 'star', '⭐'), pick('fish', 'fish', '🐟')],
      answerIds: ['apple', 'car', 'star'],
    },
  ],

  // Listening and understanding together: the sentence is heard, one word answers the question.
  heardWord: [
    {
      kind: 'listen-choose', id: 'hw-1', promptKey: 'vcPromptWhichAnimal',
      listen: [line('hw1', 'The dog is running', { focusWord: 1 })],
      choices: [pick('dog', 'dog', '🐶'), pick('cat', 'cat', '🐱'), pick('bird', 'bird', '🐦')],
      answerIds: ['dog'],
    },
    {
      kind: 'listen-choose', id: 'hw-2', promptKey: 'vcPromptWhatColour',
      listen: [line('hw2', 'I have a red hat', { focusWord: 3 })],
      choices: [pick('red', 'red', '🔴'), pick('blue', 'blue', '🔵'), pick('green', 'green', '🟢')],
      answerIds: ['red'],
    },
    {
      kind: 'listen-choose', id: 'hw-3', promptKey: 'vcPromptWhichAnimal',
      listen: [line('hw3', 'The little bird can fly', { focusWord: 2 })],
      choices: [pick('bird', 'bird', '🐦'), pick('fish', 'fish', '🐟'), pick('dog', 'dog', '🐶')],
      answerIds: ['bird'],
    },
    {
      kind: 'listen-choose', id: 'hw-4', promptKey: 'vcPromptWhatFood',
      listen: [line('hw4', 'She is eating an apple', { focusWord: 4 })],
      choices: [pick('apple', 'apple', '🍎'), pick('bread', 'bread', '🍞'), pick('rice', 'rice', '🍚')],
      answerIds: ['apple'],
    },
  ],

  // ---------------------------------------------------------------- 🧠 Understanding
  findIt: [
    {
      kind: 'listen-choose', id: 'fi-1', promptKey: 'vcPromptFind',
      listen: [line('fi1', 'Where is the ball?')],
      choices: [pick('ball', 'ball', '⚽'), pick('cup', 'cup', '🥤'), pick('shoe', 'shoe', '👟')],
      answerIds: ['ball'],
    },
    {
      kind: 'listen-choose', id: 'fi-2', promptKey: 'vcPromptFind',
      listen: [line('fi2', 'Where is the dog?')],
      choices: [pick('cat', 'cat', '🐱'), pick('dog', 'dog', '🐶'), pick('bird', 'bird', '🐦')],
      answerIds: ['dog'],
    },
    {
      kind: 'listen-choose', id: 'fi-3', promptKey: 'vcPromptFind',
      listen: [line('fi3', 'Where is the star?')],
      choices: [pick('moon', 'moon', '🌙'), pick('sun', 'sun', '☀️'), pick('star', 'star', '⭐')],
      answerIds: ['star'],
    },
  ],

  oneStep: [
    {
      kind: 'listen-choose', id: 'os-1', promptKey: 'vcPromptDoIt',
      listen: [line('os1', 'Touch the cup')],
      choices: [pick('cup', 'cup', '🥤'), pick('hat', 'hat', '🧢'), pick('book', 'book', '📗')],
      answerIds: ['cup'],
    },
    {
      kind: 'listen-choose', id: 'os-2', promptKey: 'vcPromptDoIt',
      listen: [line('os2', 'Touch the car')],
      choices: [pick('bus', 'bus', '🚌'), pick('car', 'car', '🚗'), pick('bike', 'bike', '🚲')],
      answerIds: ['car'],
    },
    {
      kind: 'listen-choose', id: 'os-3', promptKey: 'vcPromptDoIt',
      listen: [line('os3', 'Touch the fish')],
      choices: [pick('fish', 'fish', '🐟'), pick('frog', 'frog', '🐸'), pick('duck', 'duck', '🦆')],
      answerIds: ['fish'],
    },
  ],

  // Two things, in order — the step up from one instruction, and where "then" starts to matter.
  twoStep: [
    {
      kind: 'listen-choose', id: 'ts-1', promptKey: 'vcPromptDoBoth', ordered: true,
      listen: [line('ts1', 'Touch the ball, then the car')],
      choices: [pick('car', 'car', '🚗'), pick('ball', 'ball', '⚽'), pick('cup', 'cup', '🥤')],
      answerIds: ['ball', 'car'],
    },
    {
      kind: 'listen-choose', id: 'ts-2', promptKey: 'vcPromptDoBoth', ordered: true,
      listen: [line('ts2', 'Touch the sun, then the moon')],
      choices: [pick('moon', 'moon', '🌙'), pick('star', 'star', '⭐'), pick('sun', 'sun', '☀️')],
      answerIds: ['sun', 'moon'],
    },
    {
      kind: 'listen-choose', id: 'ts-3', promptKey: 'vcPromptDoBoth', ordered: true,
      listen: [line('ts3', 'Touch the dog, then the apple')],
      choices: [pick('apple', 'apple', '🍎'), pick('dog', 'dog', '🐶'), pick('bus', 'bus', '🚌')],
      answerIds: ['dog', 'apple'],
    },
  ],

  // Two concepts in one instruction: the thing AND which one. The choices differ only by the word
  // that carries the weight, so guessing the noun is not enough.
  whichOne: [
    {
      kind: 'listen-choose', id: 'wo-1', promptKey: 'vcPromptDoIt',
      listen: [line('wo1', 'Touch the red ball', { focusWord: 2 })],
      choices: [pick('red', 'red ball', '🔴'), pick('blue', 'blue ball', '🔵'), pick('green', 'green ball', '🟢')],
      answerIds: ['red'],
    },
    {
      kind: 'listen-choose', id: 'wo-2', promptKey: 'vcPromptDoIt',
      listen: [line('wo2', 'Touch the big star', { focusWord: 2 })],
      choices: [pick('big', 'big star', '⭐'), pick('small', 'small star', '✨')],
      answerIds: ['big'],
    },
    {
      kind: 'listen-choose', id: 'wo-3', promptKey: 'vcPromptDoIt',
      listen: [line('wo3', 'Touch the blue car', { focusWord: 2 })],
      choices: [pick('blue', 'blue car', '🔵'), pick('red', 'red car', '🔴'), pick('yellow', 'yellow car', '🟡')],
      answerIds: ['blue'],
    },
  ],

  // ---------------------------------------------------------------- 🎵 Voice & Intonation
  highLow: [
    { kind: 'voice-try', id: 'high-1', line: line('hi-1', 'Hello', { shape: 'high', pitch: 1.5, picture: '🐭' }), cueKey: 'vcCueHigh', optionalVoice: true },
    { kind: 'voice-try', id: 'low-1', line: line('lo-1', 'Hello', { shape: 'low', pitch: 0.6, picture: '🐻' }), cueKey: 'vcCueLow', optionalVoice: true },
    { kind: 'voice-try', id: 'high-2', line: line('hi-2', 'Come and play', { shape: 'high', pitch: 1.45, picture: '🐤' }), cueKey: 'vcCueHigh', optionalVoice: true },
    { kind: 'voice-try', id: 'low-2', line: line('lo-2', 'Come and play', { shape: 'low', pitch: 0.65, picture: '🦣' }), cueKey: 'vcCueLow', optionalVoice: true },
    {
      kind: 'listen-choose', id: 'hl-pick', promptKey: 'vcPromptWhichVoice',
      listen: [line('hl-q', 'Good morning', { shape: 'high', pitch: 1.5 })],
      choices: [
        { id: 'high', labelKey: 'vcChoiceHigh', picture: '🐭' },
        { id: 'low', labelKey: 'vcChoiceLow', picture: '🐻' },
      ],
      answerIds: ['high'],
    },
  ],

  rising: [
    { kind: 'voice-try', id: 'ri-1', line: line('ri-1', 'Ready', { shape: 'rise' }), cueKey: 'vcCueRise', optionalVoice: true },
    { kind: 'voice-try', id: 'ri-2', line: line('ri-2', 'Again', { shape: 'rise' }), cueKey: 'vcCueRise', optionalVoice: true },
    { kind: 'voice-try', id: 'ri-3', line: line('ri-3', 'You found it', { shape: 'rise' }), cueKey: 'vcCueRise', optionalVoice: true },
    {
      kind: 'listen-choose', id: 'ri-hear', promptKey: 'vcPromptWhichWay', showShapes: true,
      listen: [line('ri-h', 'All done', { shape: 'rise' })],
      choices: RISE_FALL, answerIds: ['rise'],
    },
  ],

  falling: [
    { kind: 'voice-try', id: 'fa-1', line: line('fa-1', 'All done', { shape: 'fall' }), cueKey: 'vcCueFall', optionalVoice: true },
    { kind: 'voice-try', id: 'fa-2', line: line('fa-2', 'Sit down', { shape: 'fall' }), cueKey: 'vcCueFall', optionalVoice: true },
    { kind: 'voice-try', id: 'fa-3', line: line('fa-3', 'That is mine', { shape: 'fall' }), cueKey: 'vcCueFall', optionalVoice: true },
    {
      kind: 'listen-choose', id: 'fa-hear', promptKey: 'vcPromptWhichWay', showShapes: true,
      listen: [line('fa-h', 'Time to go', { shape: 'fall' })],
      choices: RISE_FALL, answerIds: ['fall'],
    },
  ],

  loudSoft: [
    { kind: 'voice-try', id: 'lo-1', line: line('ld-1', 'Over here', { shape: 'loud', picture: '📣' }), cueKey: 'vcCueLoud', optionalVoice: true },
    { kind: 'voice-try', id: 'so-1', line: line('sf-1', 'Over here', { shape: 'soft', picture: '🤫' }), cueKey: 'vcCueSoft', optionalVoice: true },
    { kind: 'voice-try', id: 'lo-2', line: line('ld-2', 'Look at this', { shape: 'loud', picture: '📣' }), cueKey: 'vcCueLoud', optionalVoice: true },
    { kind: 'voice-try', id: 'so-2', line: line('sf-2', 'The baby is asleep', { shape: 'soft', picture: '🤫' }), cueKey: 'vcCueSoft', optionalVoice: true },
  ],

  fastSlow: [
    { kind: 'voice-try', id: 'fs-1', line: line('ft-1', 'Let us go', { shape: 'fast', rate: 1.4, picture: '🐇' }), cueKey: 'vcCueFast', optionalVoice: true },
    { kind: 'voice-try', id: 'sl-1', line: line('sl-1', 'Let us go', { shape: 'slow', rate: 0.65, picture: '🐢' }), cueKey: 'vcCueSlow', optionalVoice: true },
    { kind: 'voice-try', id: 'fs-2', line: line('ft-2', 'One two three', { shape: 'fast', rate: 1.4, picture: '🐇' }), cueKey: 'vcCueFast', optionalVoice: true },
    { kind: 'voice-try', id: 'sl-2', line: line('sl-2', 'One two three', { shape: 'slow', rate: 0.6, picture: '🐢' }), cueKey: 'vcCueSlow', optionalVoice: true },
  ],

  strongWord: [
    {
      kind: 'focus-say', id: 'sw-1', cueKey: 'vcCueStrong',
      readings: [line('sw-1a', 'I want the red ball', { focusWord: 3 }), line('sw-1b', 'I want the blue ball', { focusWord: 3 })],
    },
    {
      kind: 'focus-say', id: 'sw-2', cueKey: 'vcCueStrong',
      readings: [line('sw-2a', 'My big brother', { focusWord: 1 }), line('sw-2b', 'My big brother', { focusWord: 2 })],
    },
    {
      kind: 'focus-say', id: 'sw-3', cueKey: 'vcCueStrong',
      readings: [line('sw-3a', 'Put it on the table', { focusWord: 4 })],
    },
  ],

  copyVoice: [
    { kind: 'voice-try', id: 'cv-1', line: line('cv-1', 'Wow', { shape: 'rise-fall', picture: '🤩' }), cueKey: 'vcCueCopy', optionalVoice: true },
    { kind: 'voice-try', id: 'cv-2', line: line('cv-2', 'That is great', { shape: 'fall', picture: '🌟' }), cueKey: 'vcCueCopy', optionalVoice: true },
    { kind: 'voice-try', id: 'cv-3', line: line('cv-3', 'I like elephants', { shape: 'fall', picture: '🐘' }), cueKey: 'vcCueCopy', optionalVoice: true },
    { kind: 'voice-try', id: 'cv-4', line: line('cv-4', 'Where did it go', { shape: 'fall-rise', picture: '🔎' }), cueKey: 'vcCueCopy', optionalVoice: true },
  ],

  // ---------------------------------------------------------------- 👂 Listening
  sameDifferent: [
    { kind: 'listen-choose', id: 'sd-1', promptKey: 'vcPromptSameDifferent', listen: pair('sd1', 'Hello', 'high', 'low'), choices: SAME_DIFFERENT, answerIds: ['different'] },
    { kind: 'listen-choose', id: 'sd-2', promptKey: 'vcPromptSameDifferent', listen: pair('sd2', 'Come here', 'fall', 'fall'), choices: SAME_DIFFERENT, answerIds: ['same'] },
    { kind: 'listen-choose', id: 'sd-3', promptKey: 'vcPromptSameDifferent', listen: pair('sd3', 'All done', 'rise', 'fall'), choices: SAME_DIFFERENT, answerIds: ['different'] },
    { kind: 'listen-choose', id: 'sd-4', promptKey: 'vcPromptSameDifferent', listen: pair('sd4', 'Look at that', 'loud', 'soft'), choices: SAME_DIFFERENT, answerIds: ['different'] },
    { kind: 'listen-choose', id: 'sd-5', promptKey: 'vcPromptSameDifferent', listen: pair('sd5', 'One two three', 'slow', 'slow'), choices: SAME_DIFFERENT, answerIds: ['same'] },
  ],

  questionStatement: [
    {
      kind: 'listen-choose', id: 'qs-1', promptKey: 'vcPromptWhatDidYouHear', showShapes: true,
      listen: [line('qs-1', 'You are going home', { shape: 'rise' })],
      choices: [
        { id: 'asking', labelKey: 'vcChoiceAsking', picture: '🔵' },
        { id: 'telling', labelKey: 'vcChoiceTelling', picture: '🟢' },
      ],
      answerIds: ['asking'],
    },
    {
      kind: 'listen-choose', id: 'qs-2', promptKey: 'vcPromptWhatDidYouHear', showShapes: true,
      listen: [line('qs-2', 'You are going home', { shape: 'fall' })],
      choices: [
        { id: 'asking', labelKey: 'vcChoiceAsking', picture: '🔵' },
        { id: 'telling', labelKey: 'vcChoiceTelling', picture: '🟢' },
      ],
      answerIds: ['telling'],
    },
    { kind: 'voice-try', id: 'qs-try-a', line: line('qs-ta', 'You are going home', { shape: 'rise' }), cueKey: 'vcCueAsking', optionalVoice: true },
    { kind: 'voice-try', id: 'qs-try-b', line: line('qs-tb', 'You are going home', { shape: 'fall' }), cueKey: 'vcCueTelling', optionalVoice: true },
  ],

  whichWord: [
    {
      kind: 'focus-say', id: 'ww-1', cueKey: 'vcCueSayItToo',
      readings: [line('ww-1', 'I found my shoes', { focusWord: 1 })],
      question: { promptKey: 'vcPromptWhichWordStrong', answerIds: ['w1'] },
    },
    {
      kind: 'focus-say', id: 'ww-2', cueKey: 'vcCueSayItToo',
      readings: [line('ww-2', 'She likes green apples', { focusWord: 2 })],
      question: { promptKey: 'vcPromptWhichWordStrong', answerIds: ['w2'] },
    },
    {
      kind: 'focus-say', id: 'ww-3', cueKey: 'vcCueSayItToo',
      readings: [line('ww-3', 'We are going tomorrow', { focusWord: 3 })],
      question: { promptKey: 'vcPromptWhichWordStrong', answerIds: ['w3'] },
    },
  ],

  whatDidYouHear: [
    {
      kind: 'listen-choose', id: 'wd-1', promptKey: 'vcPromptWhatDidYouHear',
      listen: [line('wd-1', 'Really', { shape: 'rise' })],
      choices: [
        { id: 'asking', labelKey: 'vcChoiceAsking', picture: '❓' },
        { id: 'excited', labelKey: 'vcChoiceExcited', picture: '🎉' },
      ],
      answerIds: ['asking'],
    },
    {
      kind: 'listen-choose', id: 'wd-2', promptKey: 'vcPromptWhatDidYouHear',
      listen: [line('wd-2', 'Really', { shape: 'rise-fall' })],
      choices: [
        { id: 'asking', labelKey: 'vcChoiceAsking', picture: '❓' },
        { id: 'excited', labelKey: 'vcChoiceExcited', picture: '🎉' },
      ],
      answerIds: ['excited'],
    },
    {
      kind: 'listen-choose', id: 'wd-3', promptKey: 'vcPromptWhatDidYouHear',
      listen: [line('wd-3', 'Okay', { shape: 'fall' })],
      choices: [
        { id: 'asking', labelKey: 'vcChoiceAsking', picture: '❓' },
        { id: 'agreeing', labelKey: 'vcChoiceAgreeing', picture: '👍' },
      ],
      answerIds: ['agreeing'],
    },
    {
      kind: 'listen-choose', id: 'wd-4', promptKey: 'vcPromptWhatDidYouHear',
      listen: [line('wd-4', 'Okay', { shape: 'rise' })],
      choices: [
        { id: 'asking', labelKey: 'vcChoiceAsking', picture: '❓' },
        { id: 'agreeing', labelKey: 'vcChoiceAgreeing', picture: '👍' },
      ],
      answerIds: ['asking'],
    },
  ],

  // ---------------------------------------------------------------- 🚦 Turn-Taking
  myTurnYourTurn: [
    {
      kind: 'exchange', id: 'mt-hello', titleKey: 'vcExchangeHello',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'Hello!') },
        { id: 't2', who: 'child', line: line('c1', 'Hello!'), alternatives: [line('c1b', 'Hi!'), line('c1c', 'Hey!')] },
        { id: 't3', who: 'app', line: line('a2', 'What is your name?') },
        { id: 't4', who: 'child', line: line('c2', 'My name is...') },
        { id: 't5', who: 'app', line: line('a3', 'Nice to meet you!') },
        { id: 't6', who: 'child', line: line('c3', 'Nice to meet you too!') },
      ],
    },
    {
      kind: 'exchange', id: 'mt-play', titleKey: 'vcExchangePlay',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'Do you want to play?') },
        { id: 't2', who: 'child', line: line('c1', 'Yes please!'), alternatives: [line('c1b', 'Not now.'), line('c1c', 'Maybe later.')] },
        { id: 't3', who: 'app', line: line('a2', 'What shall we play?') },
        { id: 't4', who: 'child', line: line('c2', 'Let us build something.') },
      ],
    },
  ],

  waitTurn: [
    { kind: 'turn-light', id: 'wt-1', ask: line('wt-1', 'What is your favourite animal?'), ideas: [line('i1', 'A dog', { picture: '🐶' }), line('i2', 'A cat', { picture: '🐱' }), line('i3', 'An elephant', { picture: '🐘' })], readyMs: 1600 },
    { kind: 'turn-light', id: 'wt-2', ask: line('wt-2', 'What did you eat today?'), ideas: [line('i1', 'Rice', { picture: '🍚' }), line('i2', 'Bread', { picture: '🍞' }), line('i3', 'An apple', { picture: '🍎' })], readyMs: 1600 },
    { kind: 'turn-light', id: 'wt-3', ask: line('wt-3', 'What colour do you like?'), ideas: [line('i1', 'Blue', { picture: '🔵' }), line('i2', 'Red', { picture: '🔴' }), line('i3', 'Green', { picture: '🟢' })], readyMs: 1600 },
  ],

  whenCanISpeak: [
    { kind: 'turn-light', id: 'wc-1', ask: line('wc-1', 'I went to the park. Then I had a snack.'), ideas: [line('i1', 'That sounds fun!', { picture: '🙂' }), line('i2', 'What did you eat?', { picture: '❓' })], readyMs: 2200 },
    { kind: 'turn-light', id: 'wc-2', ask: line('wc-2', 'My favourite colour is yellow. What is yours?'), ideas: [line('i1', 'Mine is blue.', { picture: '🔵' }), line('i2', 'Mine is green.', { picture: '🟢' })], readyMs: 1800 },
    {
      kind: 'listen-choose', id: 'wc-3', promptKey: 'vcPromptMyTurnNow',
      listen: [line('wc-3', 'I have a new bike. What do you think?', { shape: 'rise' })],
      choices: [
        { id: 'yes', labelKey: 'vcChoiceMyTurn', picture: '🟢' },
        { id: 'no', labelKey: 'vcChoiceStillTalking', picture: '🔴' },
      ],
      answerIds: ['yes'],
    },
  ],

  keepTurn: [
    {
      kind: 'exchange', id: 'kt-day', titleKey: 'vcExchangeMyDay',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'Tell me about your day.') },
        { id: 't2', who: 'child', line: line('c1', 'First, I woke up.') },
        { id: 't3', who: 'app', line: line('a2', 'And then?') },
        { id: 't4', who: 'child', line: line('c2', 'Then I had breakfast.') },
        { id: 't5', who: 'app', line: line('a3', 'What happened after that?') },
        { id: 't6', who: 'child', line: line('c3', 'After that, I went to school.') },
      ],
    },
    { kind: 'voice-try', id: 'kt-1', line: line('kt-1', 'Wait, I am not finished', { shape: 'flat' }), cueKey: 'vcCueKeepGoing', optionalVoice: true },
    { kind: 'voice-try', id: 'kt-2', line: line('kt-2', 'and then, and then', { shape: 'rise' }), cueKey: 'vcCueKeepGoing', optionalVoice: true },
  ],

  // ---------------------------------------------------------------- 🎯 Focus
  importantWord: [
    { kind: 'focus-say', id: 'iw-1', cueKey: 'vcCueStrong', readings: [line('iw-1', 'I want the big cup', { focusWord: 3 })] },
    { kind: 'focus-say', id: 'iw-2', cueKey: 'vcCueStrong', readings: [line('iw-2', 'She has my book', { focusWord: 2 })] },
    { kind: 'focus-say', id: 'iw-3', cueKey: 'vcCueStrong', readings: [line('iw-3', 'We are going home now', { focusWord: 4 })] },
  ],

  changeMeaning: [
    {
      kind: 'focus-say', id: 'cm-1', cueKey: 'vcCueBothWays',
      readings: [line('cm-1a', 'I want the red ball', { focusWord: 3 }), line('cm-1b', 'I want the red ball', { focusWord: 4 })],
    },
    {
      kind: 'focus-say', id: 'cm-2', cueKey: 'vcCueBothWays',
      readings: [line('cm-2a', 'She took my pencil', { focusWord: 0 }), line('cm-2b', 'She took my pencil', { focusWord: 2 })],
    },
    {
      kind: 'focus-say', id: 'cm-3', cueKey: 'vcCueBothWays',
      readings: [line('cm-3a', 'We go on Monday', { focusWord: 1 }), line('cm-3b', 'We go on Monday', { focusWord: 3 })],
    },
  ],

  listenFocus: [
    {
      kind: 'focus-say', id: 'lf-1', cueKey: 'vcCueSayItToo',
      readings: [line('lf-1', 'The cat is sleeping', { focusWord: 1 })],
      question: { promptKey: 'vcPromptWhichWordStrong', answerIds: ['w1'] },
    },
    {
      kind: 'focus-say', id: 'lf-2', cueKey: 'vcCueSayItToo',
      readings: [line('lf-2', 'I lost my hat', { focusWord: 3 })],
      question: { promptKey: 'vcPromptWhichWordStrong', answerIds: ['w3'] },
    },
    {
      kind: 'focus-say', id: 'lf-3', cueKey: 'vcCueSayItToo',
      readings: [line('lf-3', 'Grandma made this cake', { focusWord: 0 })],
      question: { promptKey: 'vcPromptWhichWordStrong', answerIds: ['w0'] },
    },
  ],

  // ---------------------------------------------------------------- 💬 Conversation
  respond: [
    {
      kind: 'exchange', id: 'rs-toy', titleKey: 'vcExchangeNewToy',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'I got a new toy!', { picture: '🧸' }) },
        { id: 't2', who: 'child', line: line('c1', 'Wow!'), alternatives: [line('c1b', 'That is cool!'), line('c1c', 'Can I see it?')] },
      ],
    },
    {
      kind: 'exchange', id: 'rs-hurt', titleKey: 'vcExchangeFell',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'I fell over and hurt my knee.', { picture: '🩹' }) },
        { id: 't2', who: 'child', line: line('c1', 'Oh no!'), alternatives: [line('c1b', 'Are you okay?'), line('c1c', 'I am sorry.')] },
      ],
    },
    {
      kind: 'exchange', id: 'rs-won', titleKey: 'vcExchangeWon',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'I won the game!', { picture: '🏆' }) },
        { id: 't2', who: 'child', line: line('c1', 'Well done!'), alternatives: [line('c1b', 'That is great!'), line('c1c', 'Good job!')] },
      ],
    },
  ],

  agree: [
    { kind: 'voice-try', id: 'ag-1', line: line('ag-1', 'Yes, me too', { shape: 'fall', picture: '👍' }), cueKey: 'vcCueFriendly', optionalVoice: true },
    { kind: 'voice-try', id: 'ag-2', line: line('ag-2', 'That is a good idea', { shape: 'fall', picture: '💡' }), cueKey: 'vcCueFriendly', optionalVoice: true },
    {
      kind: 'exchange', id: 'ag-park', titleKey: 'vcExchangePark',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'Shall we go to the park?', { picture: '🌳' }) },
        { id: 't2', who: 'child', line: line('c1', 'Yes, let us go!'), alternatives: [line('c1b', 'Good idea!'), line('c1c', 'I would like that.')] },
      ],
    },
  ],

  ask: [
    { kind: 'voice-try', id: 'as-1', line: line('as-1', 'Can you help me?', { shape: 'rise', picture: '🙋' }), cueKey: 'vcCueAsking', optionalVoice: true },
    { kind: 'voice-try', id: 'as-2', line: line('as-2', 'Where is my ball?', { shape: 'fall', picture: '⚽' }), cueKey: 'vcCueAsking', optionalVoice: true },
    { kind: 'voice-try', id: 'as-3', line: line('as-3', 'Can I have some water?', { shape: 'rise', picture: '💧' }), cueKey: 'vcCueAsking', optionalVoice: true },
    { kind: 'voice-try', id: 'as-4', line: line('as-4', 'What is that?', { shape: 'fall', picture: '❓' }), cueKey: 'vcCueAsking', optionalVoice: true },
  ],

  answer: [
    {
      kind: 'turn-light', id: 'an-1', ask: line('an-1', 'How old are you?'),
      ideas: [line('i1', 'I am seven.', { picture: '7️⃣' }), line('i2', 'I am eight.', { picture: '8️⃣' })], readyMs: 1800,
    },
    {
      kind: 'turn-light', id: 'an-2', ask: line('an-2', 'What do you like to do?'),
      ideas: [line('i1', 'I like drawing.', { picture: '🎨' }), line('i2', 'I like music.', { picture: '🎵' }), line('i3', 'I like playing outside.', { picture: '🌳' })], readyMs: 2000,
    },
    {
      kind: 'turn-light', id: 'an-3', ask: line('an-3', 'Who is in your family?'),
      ideas: [line('i1', 'My mom.', { picture: '👩' }), line('i2', 'My dad.', { picture: '👨' }), line('i3', 'My sister.', { picture: '👧' })], readyMs: 2000,
    },
  ],

  startTalking: [
    { kind: 'voice-try', id: 'st-1', line: line('st-1', 'Look at my drawing!', { shape: 'rise-fall', picture: '🎨' }), cueKey: 'vcCueStartTalking', optionalVoice: true },
    { kind: 'voice-try', id: 'st-2', line: line('st-2', 'Guess what happened!', { shape: 'rise-fall', picture: '✨' }), cueKey: 'vcCueStartTalking', optionalVoice: true },
    { kind: 'voice-try', id: 'st-3', line: line('st-3', 'I want to tell you something.', { shape: 'flat', picture: '💬' }), cueKey: 'vcCueStartTalking', optionalVoice: true },
    {
      kind: 'exchange', id: 'st-show', titleKey: 'vcExchangeShow',
      turns: [
        { id: 't1', who: 'child', line: line('c1', 'Look at my drawing!'), alternatives: [line('c1b', 'I made something!')] },
        { id: 't2', who: 'app', line: line('a1', 'Wow, tell me about it!') },
        { id: 't3', who: 'child', line: line('c2', 'It is a house.') },
      ],
    },
  ],

  // ---------------------------------------------------------------- 🎭 Expression
  surprise: [
    { kind: 'voice-try', id: 'su-1', line: line('su-1', 'Oh!', { shape: 'rise-fall', picture: '😮' }), cueKey: 'vcCueSurprise', optionalVoice: true },
    { kind: 'voice-try', id: 'su-2', line: line('su-2', 'Really?', { shape: 'rise', picture: '😮' }), cueKey: 'vcCueSurprise', optionalVoice: true },
    { kind: 'voice-try', id: 'su-3', line: line('su-3', 'No way!', { shape: 'rise-fall', picture: '🤯' }), cueKey: 'vcCueSurprise', optionalVoice: true },
  ],

  excitement: [
    { kind: 'voice-try', id: 'ex-1', line: line('ex-1', 'That is amazing!', { shape: 'rise-fall', picture: '🎉' }), cueKey: 'vcCueExcited', optionalVoice: true },
    { kind: 'voice-try', id: 'ex-2', line: line('ex-2', 'Yes!', { shape: 'fall', picture: '🙌' }), cueKey: 'vcCueExcited', optionalVoice: true },
    { kind: 'voice-try', id: 'ex-3', line: line('ex-3', 'I cannot wait!', { shape: 'rise-fall', picture: '⭐' }), cueKey: 'vcCueExcited', optionalVoice: true },
  ],

  questioning: [
    { kind: 'voice-try', id: 'qu-1', line: line('qu-1', 'Really?', { shape: 'rise', picture: '🤔' }), cueKey: 'vcCueAsking', optionalVoice: true },
    { kind: 'voice-try', id: 'qu-2', line: line('qu-2', 'Are you sure?', { shape: 'rise', picture: '🤔' }), cueKey: 'vcCueAsking', optionalVoice: true },
    { kind: 'voice-try', id: 'qu-3', line: line('qu-3', 'Can I have it?', { shape: 'rise', picture: '🙏' }), cueKey: 'vcCueAsking', optionalVoice: true },
  ],

  confirming: [
    { kind: 'voice-try', id: 'cf-1', line: line('cf-1', 'Okay.', { shape: 'fall', picture: '🙂' }), cueKey: 'vcCueTelling', optionalVoice: true },
    { kind: 'voice-try', id: 'cf-2', line: line('cf-2', 'Yes, that is right.', { shape: 'fall', picture: '✅' }), cueKey: 'vcCueTelling', optionalVoice: true },
    { kind: 'voice-try', id: 'cf-3', line: line('cf-3', 'I understand.', { shape: 'fall', picture: '👌' }), cueKey: 'vcCueTelling', optionalVoice: true },
  ],

  friendly: [
    { kind: 'voice-try', id: 'fr-1', line: line('fr-1', 'Thank you.', { shape: 'fall', picture: '🤝' }), cueKey: 'vcCueFriendly', optionalVoice: true },
    { kind: 'voice-try', id: 'fr-2', line: line('fr-2', 'You are welcome.', { shape: 'fall', picture: '🙂' }), cueKey: 'vcCueFriendly', optionalVoice: true },
    { kind: 'voice-try', id: 'fr-3', line: line('fr-3', 'Would you like to join us?', { shape: 'rise', picture: '👋' }), cueKey: 'vcCueFriendly', optionalVoice: true },
    {
      kind: 'exchange', id: 'fr-share', titleKey: 'vcExchangeShare',
      turns: [
        { id: 't1', who: 'app', line: line('a1', 'Would you like to share my snack?', { picture: '🍪' }) },
        { id: 't2', who: 'child', line: line('c1', 'Yes please, thank you!'), alternatives: [line('c1b', 'No thank you.')] },
      ],
    },
  ],
};

/** Activities in an area, in the order they are shown. */
export function activitiesIn(category: PracticeAreaId): PracticeActivityDef[] {
  return PRACTICE_ACTIVITIES.filter((a) => a.category === category);
}

/** One home activity a grown-up can try, per area. Never advice — a suggestion for playing. */
export const HOME_IDEAS: Record<PracticeAreaId, string> = {
  attention: 'Play a "ready, steady, go" game before something your child is looking forward to, and make the wait a little longer each time.',
  early: 'Do a small action — a clap, a wave — and wait to see whether your child joins in. Copying them back is just as good as them copying you.',
  sounds: 'When your child says a word, say it back the way you would say it, without asking them to repeat it. Hearing it right matters more than saying it right.',
  expressive: 'When your child says one word, say it back with one word added: "ball" becomes "big ball". No need to ask them to copy.',
  understanding: 'Give one short instruction at a time and then wait, without repeating it straight away, so your child has room to work it out.',
  intonation: 'Say the same short word two ways — once with your voice going up, once going down — and let your child copy you.',
  listening: 'Hum a short tune and ask your child whether it went up or down. Swap over and let them hum one for you.',
  turns: 'Ask your child a simple question and count silently to five before saying anything else, so the turn is clearly theirs.',
  focus: 'Say a short sentence twice, leaning on a different word each time, and ask which one sounded the most important.',
  conversation: 'Tell your child one small thing that happened in your day and wait to see what they say back.',
  expression: 'Play a guessing game where you both say "Really?" in as many different ways as you can think of.',
};
