import type { TherapyActivityDef, TherapyGoalId, TherapyGroup } from './types';

/**
 * The therapy practice library.
 *
 * READ THIS BEFORE EDITING. Every entry is written to a single rule: describe the TASK and leave
 * the TECHNIQUE to the child's therapist. "Practise standing up from a chair" is a task. "Hold for
 * thirty seconds", "three sets of ten", "stretch to ninety degrees" are technique, and none of them
 * belong here — not because they are always wrong, but because the right numbers depend on a
 * particular child, and this file cannot know that child. `check:therapy` fails on that vocabulary.
 *
 * The wording is also deliberately permissive about HOW a child moves. Children with cerebral palsy
 * move in many different ways, including with a walker, a frame, a wheelchair or a helping hand, so
 * nothing here assumes a child can stand, walk unaided, or use both hands equally. An activity a
 * family cannot use is switched off in Parent Mode rather than failed.
 *
 * None of this is a programme. It is a set of familiar, real-life practice ideas a grown-up can
 * recognise, so that a therapist's own home programme has somewhere to live and be ticked off.
 */

export const THERAPY_GROUP_META: Record<TherapyGroup, { label: string; blurb: string }> = {
  grossMotor: { label: 'Gross Motor', blurb: 'Sitting, standing, moving around' },
  handFineMotor: { label: 'Hand & Fine Motor', blurb: 'Reaching, holding, using both hands' },
  movementFlexibility: { label: 'Movement & Flexibility', blurb: 'Moving gently and comfortably' },
  functional: { label: 'Functional Skills', blurb: 'Everyday jobs at home and school' },
};

export const THERAPY_GOAL_META: Record<TherapyGoalId, string> = {
  sittingBalance: 'Sitting balance',
  standing: 'Standing',
  walking: 'Walking',
  sitToStand: 'Sit to stand',
  handSkills: 'Hand skills',
  bothHands: 'Using both hands',
  writing: 'Writing',
  selfCare: 'Self-care',
  other: 'Something else',
};

/** The sentence that governs the whole section. Shown before the first activity, and in Parent Mode. */
export const THERAPY_SAFETY_NOTICE = [
  'TalkEasy therapy activities are here to support practice at home. They are not a replacement for your child’s physiotherapist or occupational therapist.',
  'If your child’s therapist has given you a home programme, follow that programme first. These activities are a starting point for a conversation with them, not instructions of their own.',
  'Stop an activity if your child has pain, dizziness, difficulty breathing, unusual distress, or a noticeable change in how they are moving — and seek advice from their therapist or doctor.',
].join('\n\n');

/** Shown wherever stretching appears. Stretching technique never comes from this app. */
export const STRETCHING_RULE =
  'Use only the stretches your child’s therapist has recommended or shown you, exactly as they showed you. TalkEasy does not describe stretches.';

export const THERAPY_ACTIVITIES: readonly TherapyActivityDef[] = [
  // ---- Gross Motor -----------------------------------------------------------------------------
  {
    id: 'sit-to-stand',
    name: 'Sit to Stand',
    group: 'grossMotor',
    dayPart: 'morning',
    icon: 'therapy-sit-to-stand',
    illustration: 'sit-to-stand',
    whatToDo: 'Practise standing up from a chair, a bench or the edge of the bed, and sitting back down. Use whatever support your child normally uses.',
    goal: 'Getting up and sitting down more easily — for meals, school and getting dressed.',
    suggestedMinutes: 5,
    parentGuidance: 'A firm seat at a comfortable height helps. Put something they want just out of reach so standing up has a point to it.',
    safetyNote: 'Stay close enough to steady your child. Stop if they seem unsteady or tired.',
    goals: ['sitToStand', 'standing'],
    inDailyRoutine: true,
  },
  {
    id: 'supported-standing',
    name: 'Supported Standing',
    group: 'grossMotor',
    dayPart: 'afternoon',
    icon: 'therapy-standing',
    illustration: 'supported-standing',
    whatToDo: 'Spend a little time standing, using the support your child usually has — a frame, a rail, furniture or your hands.',
    goal: 'Being comfortable upright, and joining in at a table or a sink.',
    suggestedMinutes: 5,
    parentGuidance: 'Give them something to do while they are up — a toy on the table, helping to stir, looking out of the window. Standing for its own sake is dull.',
    safetyNote: 'Use the support your therapist has set up. Stop if your child is uncomfortable or tired.',
    goals: ['standing'],
    inDailyRoutine: false,
  },
  {
    id: 'reaching-sitting',
    name: 'Reaching While Sitting',
    group: 'grossMotor',
    dayPart: 'morning',
    icon: 'therapy-reach',
    illustration: 'reaching-sitting',
    whatToDo: 'Sitting down, reach for things placed a little further away — to the side, forwards, and up.',
    goal: 'Staying steady while sitting, so both hands are free to play and work.',
    suggestedMinutes: 5,
    parentGuidance: 'Put favourite things in the places that are hardest to reach. Move them around so it does not become one fixed movement.',
    safetyNote: 'Make sure the seat is stable and stay within arm’s reach.',
    goals: ['sittingBalance'],
    inDailyRoutine: true,
  },
  {
    id: 'walking-practice',
    name: 'Walking Practice',
    group: 'grossMotor',
    dayPart: 'afternoon',
    icon: 'therapy-walk',
    illustration: 'walking-practice',
    whatToDo: 'Move from one place to another the way your child usually does — walking, with a walker, with a frame, or holding on.',
    goal: 'Getting around the house and school more confidently.',
    suggestedMinutes: 10,
    parentGuidance: 'Make it a journey with a purpose: to the kitchen for a snack, to the door to meet someone. Practising a real trip beats walking up and down.',
    safetyNote: 'Keep the route clear of rugs, toys and cables. Use your child’s usual walking aid.',
    goals: ['walking', 'standing'],
    inDailyRoutine: true,
  },
  {
    id: 'balance-practice',
    name: 'Balance Practice',
    group: 'grossMotor',
    dayPart: 'afternoon',
    icon: 'therapy-balance',
    illustration: 'balance-practice',
    whatToDo: 'Play games that involve staying steady — reaching, turning to look, passing something from hand to hand while sitting or standing.',
    goal: 'Staying steady while doing something else at the same time.',
    suggestedMinutes: 5,
    parentGuidance: 'Balance improves when attention is elsewhere, so hide it inside a game rather than asking them to balance.',
    safetyNote: 'Practise on a soft surface where possible, and stay close enough to steady your child.',
    goals: ['sittingBalance', 'standing'],
    inDailyRoutine: true,
  },

  // ---- Hand & Fine Motor -----------------------------------------------------------------------
  {
    id: 'reach-grasp',
    name: 'Reach & Grasp',
    group: 'handFineMotor',
    dayPart: 'handSkills',
    icon: 'therapy-grasp',
    illustration: 'reach-grasp',
    whatToDo: 'Reach for, pick up and hold different things — a cup, a block, a crayon, a snack.',
    goal: 'Picking up and holding the things they want, by themselves.',
    suggestedMinutes: 5,
    parentGuidance: 'Vary the size and weight. Things your child actually wants work far better than practice objects.',
    safetyNote: 'Choose objects that are safe if dropped, and large enough not to be a choking risk.',
    goals: ['handSkills'],
    inDailyRoutine: true,
  },
  {
    id: 'two-hand',
    name: 'Two-Hand Activities',
    group: 'handFineMotor',
    dayPart: 'handSkills',
    icon: 'therapy-two-hands',
    illustration: 'two-hand',
    whatToDo: 'Jobs that need both hands together — holding a pot while stirring, steadying paper while drawing, pulling a lid off.',
    goal: 'Using both hands as a team, with one helping and one doing.',
    suggestedMinutes: 10,
    parentGuidance: 'One hand holding and the other working counts; both hands do not have to do the same thing.',
    safetyNote: 'Pick tasks that suit your child’s hands today. Stop if either hand becomes uncomfortable.',
    goals: ['bothHands', 'handSkills'],
    inDailyRoutine: true,
  },
  {
    id: 'object-transfer',
    name: 'Object Transfer',
    group: 'handFineMotor',
    dayPart: 'handSkills',
    icon: 'therapy-transfer',
    illustration: 'object-transfer',
    whatToDo: 'Pass things from one hand to the other, and in and out of a box, a bag or a basket.',
    goal: 'Moving things between hands without dropping them.',
    suggestedMinutes: 5,
    parentGuidance: 'Tidying up is this activity in disguise, and it has an obvious ending.',
    safetyNote: 'Use objects that are safe to drop and too large to swallow.',
    goals: ['bothHands', 'handSkills'],
    inDailyRoutine: false,
  },
  {
    id: 'drawing-colouring',
    name: 'Drawing & Colouring',
    group: 'handFineMotor',
    dayPart: 'handSkills',
    icon: 'therapy-draw',
    illustration: 'drawing-colouring',
    whatToDo: 'Draw, scribble or colour with whatever is easiest to hold — thick crayons, chalk, a paintbrush, a finger.',
    goal: 'Controlling a mark on the page, and enjoying making one.',
    suggestedMinutes: 10,
    parentGuidance: 'Taping the paper down helps if holding it steady is hard. What they draw matters more than how neatly.',
    safetyNote: 'Use non-toxic materials and a comfortable, well-supported seat.',
    goals: ['handSkills', 'writing'],
    inDailyRoutine: false,
  },
  {
    id: 'writing-practice',
    name: 'Writing Practice',
    group: 'handFineMotor',
    dayPart: 'handSkills',
    icon: 'therapy-write',
    illustration: 'writing-practice',
    whatToDo: 'Practise letters, numbers or their name. TalkEasy’s Learn & Trace is one way to do it.',
    goal: 'Writing the things they need at school.',
    suggestedMinutes: 10,
    parentGuidance: 'Short and often beats one long session. Stop while it is still going well.',
    safetyNote: 'Stop if your child’s hand aches. Fatigue makes writing harder, not better.',
    goals: ['writing', 'handSkills'],
    inDailyRoutine: true,
  },

  // ---- Movement & Flexibility --------------------------------------------------------------------
  {
    id: 'active-range',
    name: 'Active Range of Motion',
    group: 'movementFlexibility',
    dayPart: 'morning',
    icon: 'therapy-move',
    illustration: 'active-range',
    whatToDo: 'Move arms, legs, hands and head through the movements your child can do themselves — reaching up, turning to look, opening and closing hands.',
    goal: 'Keeping comfortable movement, and starting the day loosened up.',
    suggestedMinutes: 5,
    parentGuidance: 'Let your child lead the movement wherever they can. Songs and reaching games carry this better than instructions.',
    safetyNote: 'Only movements your child makes themselves. Never push or pull a limb into a position.',
    goals: ['handSkills', 'sittingBalance'],
    inDailyRoutine: true,
  },
  {
    id: 'therapist-stretching',
    name: 'Stretching',
    group: 'movementFlexibility',
    dayPart: 'evening',
    icon: 'therapy-stretch',
    // A picture of stretches — on a screen that otherwise refuses to describe one. It is shown BELOW
    // the therapist deferral and captioned as a reminder of what a therapist may have demonstrated,
    // never as instructions to follow from the app (see TherapyActivityScreen).
    illustration: 'stretching',
    whatToDo: STRETCHING_RULE,
    goal: 'Staying comfortable, exactly as your child’s therapist has planned.',
    suggestedMinutes: 10,
    parentGuidance: 'If you are unsure of any part of what you were shown, ask your therapist before doing it. Guessing at a stretch is not worth the risk.',
    safetyNote: 'Only the stretches your therapist has shown you, as they showed you. Stop immediately if your child has pain.',
    goals: ['other'],
    // NOT in the daily routine, deliberately. A routine slot labelled "stretch every morning" is an
    // instruction, and stretching is the one thing here that must come from a therapist rather than
    // from an app's schedule. It stays one tap away in the library for families who were given one.
    inDailyRoutine: false,
    therapistLedOnly: true,
  },
  {
    id: 'gentle-movement',
    name: 'Gentle Movement',
    group: 'movementFlexibility',
    dayPart: 'evening',
    icon: 'therapy-gentle',
    illustration: 'gentle-movement',
    whatToDo: 'Slow, easy movement to wind down — rocking, swaying to music, slow reaching, a gentle change of position.',
    goal: 'Settling comfortably at the end of the day.',
    suggestedMinutes: 5,
    parentGuidance: 'Quiet music and dim light help. This one is about comfort, not achievement.',
    safetyNote: 'Keep it slow and comfortable. Stop if your child is distressed.',
    goals: ['other'],
    inDailyRoutine: true,
  },

  // ---- Functional Skills ---------------------------------------------------------------------------
  {
    id: 'dressing',
    name: 'Dressing Practice',
    group: 'functional',
    dayPart: 'morning',
    icon: 'therapy-dressing',
    illustration: 'dressing',
    whatToDo: 'Take on one part of getting dressed — an arm into a sleeve, a sock, a zip, a button.',
    goal: 'Doing more of getting dressed themselves.',
    suggestedMinutes: 10,
    parentGuidance: 'Pick one step and let them finish it while you do the rest. Finishing a step feels like success; starting one they cannot finish does not.',
    safetyNote: 'Allow plenty of time, in a safe seated position. Rushing is when things go wrong.',
    goals: ['selfCare', 'bothHands'],
    inDailyRoutine: false,
  },
  {
    id: 'containers',
    name: 'Opening Containers',
    group: 'functional',
    dayPart: 'handSkills',
    icon: 'therapy-container',
    illustration: 'containers',
    whatToDo: 'Open and close lunch boxes, bottles, jars, pots and bags.',
    goal: 'Opening their own lunch and drink at school.',
    suggestedMinutes: 5,
    parentGuidance: 'Practise the containers that actually go to school. That is the one that matters on Monday.',
    safetyNote: 'Use empty or sealed containers. Avoid anything sharp or breakable.',
    goals: ['bothHands', 'handSkills', 'selfCare'],
    inDailyRoutine: false,
  },
  {
    id: 'school-tasks',
    name: 'School Tasks',
    group: 'functional',
    dayPart: 'afternoon',
    icon: 'therapy-school-task',
    illustration: 'school-tasks',
    whatToDo: 'Practise the jobs the school day asks for — opening the bag, taking out a book, turning pages, using a pencil case.',
    goal: 'Keeping up with the practical parts of the school day.',
    suggestedMinutes: 10,
    parentGuidance: 'Ask the teacher which part of the day is hardest, and practise that one.',
    safetyNote: 'Keep sessions short. Stop before frustration sets in.',
    goals: ['handSkills', 'selfCare'],
    inDailyRoutine: false,
  },
  {
    id: 'self-care',
    name: 'Self-Care Activities',
    group: 'functional',
    dayPart: 'evening',
    icon: 'therapy-self-care',
    illustration: 'self-care',
    whatToDo: 'Everyday care — washing hands, brushing teeth, brushing hair, using a flannel.',
    goal: 'Looking after themselves with less help.',
    suggestedMinutes: 10,
    parentGuidance: 'Doing it at the real time of day, in the real place, is what makes it stick.',
    safetyNote: 'Stay with your child near water. Check water temperature yourself.',
    goals: ['selfCare', 'bothHands'],
    inDailyRoutine: false,
  },

  // ---- Added for the daily routine -----------------------------------------------------------------
  {
    id: 'active-play',
    name: 'Active Play',
    group: 'grossMotor',
    dayPart: 'afternoon',
    icon: 'therapy-balance',
    illustration: 'active-play',
    whatToDo: 'Play something that gets your child moving, however they move — rolling or throwing a ball, reaching for bubbles, music and movement, a game of chase.',
    goal: 'Moving more, because it is fun rather than because it is practice.',
    suggestedMinutes: 15,
    parentGuidance: 'Follow what your child finds funny. The best practice of the day is usually the bit they did not notice was practice.',
    safetyNote: 'Clear the space of hard edges first, and stop when your child has had enough rather than at a set time.',
    goals: ['walking', 'standing', 'sittingBalance'],
    inDailyRoutine: true,
  },
  {
    id: 'relaxation',
    name: 'Relaxation',
    group: 'movementFlexibility',
    dayPart: 'evening',
    icon: 'therapy-gentle',
    illustration: 'relaxation',
    whatToDo: 'Settle somewhere comfortable together — quiet music, a story, dimmed lights, slow breathing if your child likes it.',
    goal: 'Ending the day calm and comfortable.',
    suggestedMinutes: 10,
    parentGuidance: 'Nothing has to be achieved here. If your child falls asleep, the activity worked.',
    safetyNote: 'Make sure your child is well supported and comfortable in whatever position they settle in.',
    goals: ['other'],
    inDailyRoutine: true,
  },
];

/** Activities in a group, in order. */
export function activitiesInGroup(group: TherapyGroup): TherapyActivityDef[] {
  return THERAPY_ACTIVITIES.filter((a) => a.group === group);
}

export function therapyActivity(id: string): TherapyActivityDef | undefined {
  return THERAPY_ACTIVITIES.find((a) => a.id === id);
}
