/**
 * Therapy home practice — types. Pure, no React, so the checks can import it.
 *
 * WHAT THIS SECTION IS, AND WHAT IT IS NOT.
 *
 * It is a place to RECORD and ENCOURAGE practice a child's own therapist has already asked for. It
 * is not a programme, not an assessment, and not a substitute for a physiotherapist or occupational
 * therapist — and the code is shaped so it cannot quietly drift into being one:
 *
 *  - No activity carries a dosage. There are no repetitions, sets, resistance, weights, stretch
 *    angles or hold times anywhere in the content, because prescribing those for a particular child
 *    is the therapist's job and getting them wrong can hurt. `check:therapy` fails the build if that
 *    vocabulary appears.
 *  - `suggestedMinutes` is a rough "how long this usually takes", never a target to reach.
 *  - Stretching is the sharpest edge, so it is handled explicitly: a stretching activity may only
 *    say to follow what the therapist demonstrated. It never describes a stretch.
 *  - Nothing is scored. A session records THAT practice happened, like every other practice area in
 *    TalkEasy — no quality, no range, no measurement, nothing a parent could read as a result.
 *
 * The content TalkEasy ships is a starting point for a conversation with a therapist, and the app
 * says so. A family's real programme comes from their own clinician, and any activity here can be
 * switched off.
 */

/** The four parts of the library. Ordered as the section lists them. */
export type TherapyGroup = 'grossMotor' | 'handFineMotor' | 'movementFlexibility' | 'functional';

/** Where an activity sits in My Therapy Day. 'handSkills' is a block of its own, not a time. */
export type DayPart = 'morning' | 'afternoon' | 'handSkills' | 'evening';

/** What a grown-up says they would like their child to practise. */
export type TherapyGoalId =
  | 'sittingBalance'
  | 'standing'
  | 'walking'
  | 'sitToStand'
  | 'handSkills'
  | 'bothHands'
  | 'writing'
  | 'selfCare'
  | 'other';

export interface TherapyActivityDef {
  /** Stable id. Used for session records and for the parent's hidden list; never renamed. */
  id: string;
  name: string;
  group: TherapyGroup;
  /** Where it appears in My Therapy Day. */
  dayPart: DayPart;
  /** The icon name, from the TalkEasy icon set (components/icons). */
  icon: string;
  /**
   * Key of a step-by-step picture for the activity screen, registered in
   * `components/therapy/illustrations.ts`. Most activities have none and show their icon instead.
   *
   * A KEY, not a `require()`: this module is imported by `check:therapy`, which runs in Node where
   * a bundler's asset import does not resolve.
   */
  illustration?: string;
  /** What to do, in a parent's words. Short — a long instruction does not get read. */
  whatToDo: string;
  /**
   * What the practice is FOR, in everyday terms ("getting up from a chair on their own").
   *
   * Deliberately a real-life outcome rather than a body part or a movement pattern: this section
   * exists to support goal-directed, task-specific practice, and a goal a family recognises from
   * their own day is the one that gets practised.
   */
  goal: string;
  /** Roughly how long it tends to take. Never a target, and never a minimum. */
  suggestedMinutes: number;
  /** One concrete thing the grown-up can do to help. */
  parentGuidance: string;
  /** Always present, always specific to this activity. Enforced by check:therapy. */
  safetyNote: string;
  /** Goals this activity contributes to, for the Parent Goals screen. */
  goals: TherapyGoalId[];
  /**
   * Whether this appears in MY THERAPY DAY, as opposed to only in the library.
   *
   * The day is a SHORT, DOABLE ROUTINE — a handful of things a family can actually get through
   * between breakfast and bedtime. The library is everything there is. Putting all seventeen
   * activities on one day would produce a list nobody finishes, and a list nobody finishes is a
   * list that makes a parent feel behind rather than supported.
   *
   * A grown-up can still reach every library activity any time; this only decides what the day
   * suggests by default.
   */
  inDailyRoutine: boolean;
  /**
   * True when the activity may ONLY be done as a therapist has demonstrated it.
   *
   * Set on stretching and on anything where a described technique could do harm. The activity
   * screen leads with that sentence instead of instructions.
   */
  therapistLedOnly?: boolean;
}

/** A recorded practice. No measurement, no quality, no clinical reading of any kind. */
export interface TherapySession {
  id: number;
  activityId: string;
  group: TherapyGroup;
  durationMs: number;
  createdAt: string;
}
