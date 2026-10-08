import { QUESTIONS_PER_SESSION as N, mcq } from '../engine';
import type { LearningActivity, LearningSubjectKey, Option, Question, Rng } from '../types';
import type { Difficulty } from '@/types/models';

/**
 * LEVELS: every Play & Learn subject is a road of 100 short levels, one after another (like Learn & Trace).
 * A level is an ordinary `LearningActivity` (so the practice screen, stars, best-result and Parent Mode progress all
 * work unchanged) with a key like `english.l012`. Levels are NOT in the subject's activity list: Parent Mode would
 * otherwise list 500 switches. They are found by `getActivity` through `LEVEL_ACTIVITY_MAP`.
 *
 * Each subject is ten topics of ten levels. Inside a topic the questions get harder (2 answers, then 3, then 4) and
 * each level takes a different window of the topic's bank of questions, so no two levels are the same session.
 * Nothing is timed and a wrong tap is never scolded: the same kind rules as every other activity.
 */
export interface LevelDef extends LearningActivity {
  level: number;
  /** The topic this level belongs to (e.g. "Rhyming words"). */
  topic: string;
  /** 1..10 inside its topic. */
  step: number;
}

export const LEVELS_PER_SUBJECT = 100;
export const LEVELS_PER_TOPIC = 10;

/** Easy for the first three steps of a topic, medium to the seventh, hard after that. */
export function tierFor(step: number): Difficulty {
  return step <= 3 ? 'easy' : step <= 7 ? 'medium' : 'hard';
}

export const levelKey = (subject: LearningSubjectKey, level: number) => `${subject}.l${String(level).padStart(3, '0')}`;

/** One fact: `prompt|answer|wrong1|wrong2|wrong3|emoji|explain` (the last two are optional). No "|" inside a field. */
export interface Fact {
  prompt: string;
  answer: string;
  wrong: string[];
  emoji?: string;
  explain?: string;
}

export function parseFacts(rows: readonly string[]): Fact[] {
  return rows.map((row) => {
    const f = row.split('|');
    // 3 wrong answers at f[2..4]; emoji and explain after them.
    return { prompt: f[0], answer: f[1], wrong: [f[2], f[3], f[4]].filter(Boolean), emoji: f[5] || undefined, explain: f[6] || undefined };
  });
}

export function factQuestion(rng: Rng, tier: Difficulty, f: Fact): Question {
  return mcq(rng, tier, f.prompt, { label: f.answer }, f.wrong.map((x): Option => ({ label: x })), {
    promptEmoji: f.emoji,
    speak: f.prompt,
    explain: f.explain ?? `Yes! ${f.answer}.`,
  });
}

interface TopicOptions {
  subject: LearningSubjectKey;
  /** 1-based topic number; its levels are (n-1)*10+1 .. n*10. */
  topicNo: number;
  topic: string;
  emoji: string;
  /** Plain facts: levels slide a window across them. */
  facts?: Fact[];
  /** Or a custom maker (maths, generated questions): gets the step 1..10. */
  make?: (step: number, tier: Difficulty, rng: Rng) => Question[];
  /** Short line for the card. */
  blurb: string;
}

/** The ten levels of one topic. */
export function topicLevels(o: TopicOptions): LevelDef[] {
  const out: LevelDef[] = [];
  for (let step = 1; step <= LEVELS_PER_TOPIC; step++) {
    const level = (o.topicNo - 1) * LEVELS_PER_TOPIC + step;
    const tier = tierFor(step);
    const facts = o.facts;
    out.push({
      key: levelKey(o.subject, level),
      subjectKey: o.subject,
      level,
      topic: o.topic,
      step,
      title: `${o.topic} ${step}`,
      emoji: o.emoji,
      description: o.blurb,
      generate: (_d, rng) => {
        if (o.make) return o.make(step, tier, rng);
        const bank = facts ?? [];
        // A window of six that moves three along each step, wrapping round the bank.
        const picked: Fact[] = [];
        for (let i = 0; i < N; i++) picked.push(bank[((step - 1) * 3 + i) % bank.length]);
        return rng.shuffle(picked).map((f) => factQuestion(rng, tier, f));
      },
    });
  }
  return out;
}
