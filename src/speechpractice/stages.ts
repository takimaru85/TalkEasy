import type { AdventureKey } from '@/theme/adventure';
import type { PracticeAreaId } from '@/practice/types';
import type { ActivityId } from './types';

/**
 * Speech Practice, as a LADDER rather than a dashboard.
 *
 * The old screen showed all twenty activities at once, grouped by beginner / intermediate /
 * advanced. That grouping tells a grown-up about difficulty; it tells a CHILD nothing about what
 * they are practising, so the screen answered "what is available?" when the only question worth
 * answering is "what am I working on right now?".
 *
 * These five stages are that answer, and they are the order speech production is built in:
 *
 *   sounds -> syllables -> words -> phrases -> sentences
 *
 * Nothing is locked and nothing was deleted. Every activity that was on the old screen is still
 * here — either inside the stage it belongs to, or moved to Listen & Talk because it was never
 * speech production in the first place (see MOVED_TO_PRACTICE).
 */

export type SpeechStageId = 'sounds' | 'syllables' | 'words' | 'phrases' | 'sentences';

export const SPEECH_STAGE_IDS: SpeechStageId[] = ['sounds', 'syllables', 'words', 'phrases', 'sentences'];

/**
 * A stage's activities come from two modules: the original Speech Practice set, and the
 * sound-ladder activities in `src/practice`. Both are real activities with real screens — the
 * member simply says which route opens it, so one stage can list both without either module
 * having to know about the other.
 */
export type StageMember =
  | { module: 'speech'; id: ActivityId }
  | { module: 'practice'; id: string };

export interface SpeechStageDef {
  id: SpeechStageId;
  emoji: string;
  icon: string;
  titleKey: 'spStageSounds' | 'spStageSyllables' | 'spStageWords' | 'spStagePhrases' | 'spStageSentences';
  subtitleKey: 'spStageSoundsSub' | 'spStageSyllablesSub' | 'spStageWordsSub' | 'spStagePhrasesSub' | 'spStageSentencesSub';
  /**
   * One colour FAMILY per stage, not a different saturated colour per card. Inside a stage every
   * tile is a shade of this, so the child can see at a glance that they are all the same kind of
   * thing.
   */
  color: AdventureKey;
  members: StageMember[];
}

export const SPEECH_STAGES: SpeechStageDef[] = [
  {
    id: 'sounds',
    emoji: '🔊',
    icon: 'waveform',
    titleKey: 'spStageSounds',
    subtitleKey: 'spStageSoundsSub',
    color: 'sky',
    members: [
      { module: 'practice', id: 'soundListen' },
      { module: 'speech', id: 'sounds' },
      { module: 'speech', id: 'matching' },
      { module: 'practice', id: 'soundSay' },
      { module: 'speech', id: 'imitation' },
    ],
  },
  {
    id: 'syllables',
    emoji: '🔤',
    icon: 'format-letter-case',
    titleKey: 'spStageSyllables',
    subtitleKey: 'spStageSyllablesSub',
    color: 'grape',
    members: [
      { module: 'speech', id: 'syllables' },
      { module: 'practice', id: 'soundSyllable' },
      { module: 'speech', id: 'rhythm' },
    ],
  },
  {
    id: 'words',
    emoji: '📝',
    icon: 'text-short',
    titleKey: 'spStageWords',
    subtitleKey: 'spStageWordsSub',
    color: 'grass',
    members: [
      { module: 'speech', id: 'words' },
      { module: 'practice', id: 'soundWord' },
      { module: 'speech', id: 'repetition' },
      // Picture Naming earns its place here as TARGET-WORD practice: the point is the sound in
      // "ball", not learning what a ball is. As vocabulary teaching it would belong elsewhere.
      { module: 'speech', id: 'pictureNaming' },
    ],
  },
  {
    id: 'phrases',
    emoji: '💬',
    icon: 'chat-processing-outline',
    titleKey: 'spStagePhrases',
    subtitleKey: 'spStagePhrasesSub',
    color: 'sun',
    members: [
      { module: 'speech', id: 'phrases' },
      { module: 'practice', id: 'soundPhrase' },
      { module: 'speech', id: 'voice' },
    ],
  },
  {
    id: 'sentences',
    emoji: '📖',
    icon: 'text-long',
    titleKey: 'spStageSentences',
    subtitleKey: 'spStageSentencesSub',
    color: 'reef',
    members: [
      { module: 'speech', id: 'sentences' },
      { module: 'practice', id: 'soundSentence' },
      { module: 'speech', id: 'questions' },
      { module: 'speech', id: 'stories' },
      { module: 'practice', id: 'soundChat' },
    ],
  },
];

/**
 * Activities that were on the Speech Practice screen but are not speech PRODUCTION.
 *
 * They are listening, understanding, vocabulary and social skills, which is what Listen & Talk is
 * for — and several of them duplicated an area that already existed there. None is deleted: each
 * now appears in the Listen & Talk area named here, so a family that used one still has it, in the
 * place it actually belongs.
 */
export const MOVED_TO_PRACTICE: Partial<Record<ActivityId, PracticeAreaId>> = {
  listening: 'attention',
  memory: 'attention',
  directions: 'understanding',
  vocabulary: 'expressive',
  social: 'conversation',
  rolePlay: 'conversation',
  turnTaking: 'turns',
};

export function getStage(id: string): SpeechStageDef | undefined {
  return SPEECH_STAGES.find((s) => s.id === id);
}

/** The Listen & Talk activities a stage borrows — used to keep them out of that section's own list. */
export function practiceIdsInStages(): string[] {
  return SPEECH_STAGES.flatMap((s) => s.members.filter((m) => m.module === 'practice').map((m) => m.id));
}

/**
 * A stage's members, minus anything a parent has hidden in Parent Mode.
 *
 * Hiding is a parent's decision and it has to survive the reorganisation: an activity they turned
 * off must stay off wherever it now lives. Practice-module members have no hide switch of their
 * own, so they are always shown.
 */
export function visibleMembers(stage: SpeechStageDef, hidden: Set<string>): StageMember[] {
  return stage.members.filter((m) => m.module === 'practice' || !hidden.has(m.id));
}
