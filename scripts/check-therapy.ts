// Checks the Therapy home-practice section. Run: npm run check:therapy
//
// This check exists to stop the section drifting into being a prescription. TalkEasy is not a
// physiotherapist, the families using it have children whose needs differ enormously, and content
// that quietly acquires a dosage or a measurement is content that can hurt somebody. Everything
// below is a rule it should not be possible to break by accident.
import {
  STRETCHING_RULE,
  THERAPY_ACTIVITIES,
  THERAPY_GOAL_META,
  THERAPY_GROUP_META,
  THERAPY_SAFETY_NOTICE,
  activitiesInGroup,
  therapyActivity,
} from '../src/therapy/content';
import {
  DAY_PARTS,
  activitiesForDayPart,
  activitiesForGoal,
  dayProgress,
  parseGoals,
  parseHidden,
  todaysPlan,
  weekSummary,
  withGoal,
  withHidden,
} from '../src/therapy/day';
import { existsSync, readFileSync } from 'node:fs';
import * as T from '../src/therapy/timer';
import { ILLUSTRATION_SHAPES, illustrationRatio } from '../src/therapy/illustrationShapes';
import type { TherapyGoalId, TherapyGroup } from '../src/therapy/types';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const GROUPS = Object.keys(THERAPY_GROUP_META) as TherapyGroup[];
const GOALS = Object.keys(THERAPY_GOAL_META) as TherapyGoalId[];

// ---- structure -----------------------------------------------------------------------------------
ok(THERAPY_ACTIVITIES.length >= 15, 'the library covers the four groups properly');
ok(new Set(THERAPY_ACTIVITIES.map((a) => a.id)).size === THERAPY_ACTIVITIES.length, 'activity ids are unique');
GROUPS.forEach((g) => ok(activitiesInGroup(g).length >= 3, `${g}: has activities`));
DAY_PARTS.forEach((p) => ok(THERAPY_ACTIVITIES.some((a) => a.dayPart === p.id), `${p.id}: has at least one activity`));
ok(therapyActivity('sit-to-stand')?.name === 'Sit to Stand', 'an activity can be looked up by id');
ok(therapyActivity('nope') === undefined, 'an unknown id resolves to nothing');

// ---- NO DOSAGE, ANYWHERE -------------------------------------------------------------------------
// Repetitions, sets, resistance, weights, angles and hold times are a therapist's decision about a
// particular child. An app that ships them is guessing with somebody's child.
const DOSAGE = [
  /\b\d+\s*(reps?|repetitions?|sets?)\b/i,
  /\b(reps?|repetitions?|sets)\s*(of|x)\s*\d+/i,
  /\bhold (it |this |the position )?for\s*\d+/i,
  /\b\d+\s*(seconds?|secs?)\b/i,
  /\b\d+\s*(degrees?|°)/i,
  /\b\d+\s*(kg|kilos?|lbs?|pounds?)\b/i,
  /\bresistance band\b/i,
  // LOADING, not the word "weight". Telling a parent an object's weight is useful ("vary the size
  // and weight of what they pick up"); telling them to ADD load is a prescription, and strapping a
  // weight to a child's limb on an app's say-so is exactly what this section must never cause.
  /\b(ankle|wrist|hand) weights?\b/i,
  /\bdumbbells?\b/i,
  /\bweighted (vest|blanket|cuff)\b/i,
  /\badd(ing)? (weight|resistance|load)\b/i,
  /\bthree times a day\b/i,
  /\b\d+\s*times (a|per) (day|week)\b/i,
];
for (const a of THERAPY_ACTIVITIES) {
  const text = `${a.name} ${a.whatToDo} ${a.goal} ${a.parentGuidance} ${a.safetyNote}`;
  for (const pattern of DOSAGE) {
    ok(!pattern.test(text), `${a.id}: must not prescribe a dosage (${pattern})`);
  }
}

// ---- every activity carries its own safety note ----------------------------------------------------
for (const a of THERAPY_ACTIVITIES) {
  ok(a.safetyNote.trim().length >= 25, `${a.id}: has a real safety note, not a token one`);
  ok(a.parentGuidance.trim().length >= 25, `${a.id}: tells the grown-up something useful`);
  ok(a.goal.trim().length >= 15, `${a.id}: states what the practice is for`);
  ok(a.suggestedMinutes > 0 && a.suggestedMinutes <= 20, `${a.id}: suggested time is short and sane`);
  ok(a.goals.length > 0, `${a.id}: contributes to at least one goal`);
  ok(a.goals.every((g) => GOALS.includes(g)), `${a.id}: every goal it claims exists`);
}
// Safety notes must be specific. If two activities share one, it has become boilerplate nobody reads.
ok(
  new Set(THERAPY_ACTIVITIES.map((a) => a.safetyNote)).size === THERAPY_ACTIVITIES.length,
  'every safety note is specific to its activity',
);

// ---- stretching is therapist-led, and never described -----------------------------------------------
const stretching = THERAPY_ACTIVITIES.filter((a) => /stretch/i.test(a.name) || /stretch/i.test(a.whatToDo));
ok(stretching.length > 0, 'stretching appears, since families are given stretches to do');
for (const a of stretching) {
  ok(a.therapistLedOnly === true, `${a.id}: stretching is marked therapist-led`);
  ok(
    /therapist/i.test(a.whatToDo) && /shown|recommend|demonstrat/i.test(a.whatToDo),
    `${a.id}: defers the technique to the therapist instead of describing one`,
  );
}
ok(/therapist/i.test(STRETCHING_RULE) && /only/i.test(STRETCHING_RULE), 'the stretching rule defers to the therapist');
// A described stretch is the thing this section must never contain.
for (const a of THERAPY_ACTIVITIES) {
  ok(!/\b(pull|push|force|straighten the|bend the)\b.*\b(leg|arm|knee|elbow|ankle|wrist)\b/i.test(a.whatToDo),
    `${a.id}: never tells a parent to move a limb for the child`);
}

// ---- the section never claims to be treatment -------------------------------------------------------
const CLINICAL = ['diagnos', 'treatment plan', 'prescrib', 'therapy session', 'rehabilitat', 'assess'];
for (const a of THERAPY_ACTIVITIES) {
  const text = `${a.name} ${a.whatToDo} ${a.goal} ${a.parentGuidance}`.toLowerCase();
  for (const word of CLINICAL) {
    ok(!text.includes(word), `${a.id}: avoids clinical framing ("${word}")`);
  }
}

// The notice has to say the three things that matter, in plain words.
const notice = THERAPY_SAFETY_NOTICE.toLowerCase();
ok(notice.includes('not a replacement'), 'the notice says this is not a replacement for a therapist');
ok(notice.includes('physiotherapist') && notice.includes('occupational therapist'), 'the notice names both professions');
ok(notice.includes('follow that programme first'), "the notice puts the therapist's own programme first");
ok(['pain', 'dizziness', 'breathing', 'distress'].every((w) => notice.includes(w)), 'the notice lists what to stop for');

// ---- nothing in the section measures a child ----------------------------------------------------------
// Coverage ("practised" / "not yet") is all this section may ever show. A number that looks like a
// result invites a parent to read progress into it, and there is no measurement here to support that.
ok(weekSummary(0) === 'No practice recorded yet this week', 'an empty week reads as empty, not as zero out of something');
ok(weekSummary(1).includes('1 practice ') || weekSummary(1).includes('1 practice'), 'one practice is singular');
ok(weekSummary(12) === '12 practices this week', 'a week is a count of practices, never a score');
ok(!/%|score|level|grade|out of/i.test(weekSummary(12)), 'the week summary is not a score');

// ---- the day plan ----------------------------------------------------------------------------------
const none = new Set<string>();
// THE DAY IS THE ROUTINE, NOT THE LIBRARY. A day listing every activity is a list nobody finishes,
// and a list nobody finishes makes a parent feel behind rather than supported.
const routine = THERAPY_ACTIVITIES.filter((a) => a.inDailyRoutine);
ok(todaysPlan(none, []).length === routine.length, 'with no goals chosen, the day offers the whole routine');
ok(routine.length < THERAPY_ACTIVITIES.length, 'the routine is SHORTER than the library');
ok(routine.length >= 8 && routine.length <= 14, 'the routine is a day a family could actually get through');
DAY_PARTS.forEach((p) => {
  const inPart = routine.filter((a) => a.dayPart === p.id);
  ok(inPart.length >= 2, `${p.id}: the routine has something in it`);
  ok(inPart.length <= 4, `${p.id}: the routine block stays short`);
});
// Stretching must never be scheduled BY THE APP. A routine slot that says "stretch every morning"
// is an instruction, and the only instruction this app may give about stretching is "ask your
// therapist". It stays reachable in the library for families who were given a stretch to do.
THERAPY_ACTIVITIES.filter((a) => a.therapistLedOnly).forEach((a) => {
  ok(!a.inDailyRoutine, `${a.id}: a therapist-led activity is never put on the daily routine`);
});
// Every library activity still has a home, so none is unreachable.
ok(THERAPY_ACTIVITIES.every((a) => activitiesInGroup(a.group).includes(a)), 'every activity is in its group');
const walkOnly = todaysPlan(none, ['walking']);
ok(walkOnly.length > 0 && walkOnly.every((a) => a.goals.includes('walking')), 'choosing a goal narrows the day to it');
ok(walkOnly.length < THERAPY_ACTIVITIES.length, 'and narrowing actually removes something');

// A grown-up can switch anything off, and it disappears everywhere.
const hidden = parseHidden('sit-to-stand,walking-practice');
ok(hidden.size === 2, 'the hidden list parses');
ok(!todaysPlan(hidden, []).some((a) => hidden.has(a.id)), 'a hidden activity never appears in the day');
ok(!activitiesForGoal('walking', hidden).some((a) => a.id === 'walking-practice'), 'nor in a goal it used to serve');
ok(parseHidden('').size === 0 && parseHidden(null).size === 0, 'an empty hidden list is empty');
ok(withHidden('', 'dressing', true) === 'dressing', 'an activity can be switched off');
ok(withHidden('dressing', 'dressing', false) === '', 'and switched back on');
ok(withHidden('dressing', 'dressing', true) === 'dressing', 'switching off twice does not duplicate');

ok(parseGoals('walking,writing').length === 2, 'goals parse');
ok(parseGoals('walking,nonsense').length === 1, 'an unknown goal is dropped rather than trusted');
ok(parseGoals(null).length === 0, 'no goals is no goals');
ok(withGoal('', 'walking', true) === 'walking' && withGoal('walking', 'walking', false) === '', 'goals toggle');

// Progress counts distinct activities, so repeating one cannot complete the day.
const plan = todaysPlan(none, []);
ok(dayProgress(plan, new Set()).done === 0, 'a fresh day is at zero');
ok(dayProgress(plan, new Set(['sit-to-stand'])).done === 1, 'one practised activity counts once');
ok(dayProgress(plan, new Set(plan.map((a) => a.id))).done === plan.length, 'a finished day is finished');
ok(dayProgress(plan, new Set(['not-in-plan'])).done === 0, 'something off the plan does not count towards it');
DAY_PARTS.forEach((p) => {
  const inPart = activitiesForDayPart(p.id, none, []);
  ok(inPart.every((a) => a.dayPart === p.id), `${p.id}: only its own activities`);
});

// ---- a named illustration actually exists ----------------------------------------------------------
// The content carries a KEY and the image is registered in React-land (illustrations.ts), because
// check:therapy runs in Node where a bundler asset import does not resolve. The cost of that split
// is that a typo would not surface until a parent opened the screen — so it is checked here.
{
  const reg = readFileSync('src/components/therapy/illustrations.ts', 'utf8');
  for (const a of THERAPY_ACTIVITIES.filter((x) => x.illustration)) {
    ok(reg.includes(`'${a.illustration}'`), `${a.id}: its illustration "${a.illustration}" is registered`);
    const line = reg.split('\n').find((l) => l.includes(`'${a.illustration}':`)) ?? '';
    const quoted = line.slice(line.indexOf('require(') + 9, line.lastIndexOf("'"));
    ok(quoted.length > 0, `${a.id}: the illustration resolves to a file`);
    if (quoted) {
      const onDisk = quoted.replace(/^(\.\.\/)+/, '');
      ok(existsSync(onDisk), `${a.id}: ${onDisk} exists on disk`);
    }
  }

  // A picture never replaces the written steps: words baked into an image cannot be read aloud,
  // do not grow with the OS font size, and are invisible to a screen reader.
  const screen = readFileSync('src/screens/child/therapy/TherapyActivityScreen.tsx', 'utf8');
  ok(!screen.includes('>WHAT TO DO</Text>'), 'the WHAT TO DO card is gone (removed by request) and must not creep back');
  ok(screen.includes('activity.whatToDo'), 'the written steps stay in the data and in the picture\'s accessibility label');
  ok(screen.includes('accessibilityLabel'), 'the picture carries an accessible description');
  ok(!screen.includes('height: artSize') && screen.includes('artHeight') && screen.includes('illustrationRatio('), 'a picture is sized from its own shape, so a landscape one is not boxed into a square');
  ok(!screen.includes('Image.resolveAssetSource('), 'the screen does not read picture sizes with resolveAssetSource (it crashes react-native-web)');
  // every picture's shape: the table must agree with the file, or a wide picture is boxed wrongly
  for (const a of THERAPY_ACTIVITIES.filter((x) => x.illustration)) {
    const buf = readFileSync(new URL(`../assets/therapy/${a.illustration}.webp`, import.meta.url));
    let w = 0;
    let h = 0;
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8X') { w = 1 + buf.readUIntLE(24, 3); h = 1 + buf.readUIntLE(27, 3); }
    else if (kind === 'VP8 ') { w = buf.readUInt16LE(26) & 0x3fff; h = buf.readUInt16LE(28) & 0x3fff; }
    ok(w > 0 && h > 0, `${a.illustration}: the picture's size could be read`);
    ok(Math.abs(w / h - illustrationRatio(a.illustration)) < 0.01, `${a.illustration}: its listed shape matches the file (${w}x${h})`);
  }
  ok(Object.keys(ILLUSTRATION_SHAPES).every((k) => THERAPY_ACTIVITIES.some((x) => x.illustration === k)), 'every listed shape belongs to a real picture');
  ok(!/aspectRatio:\s*[0-9a-z]/.test(screen.replace(/aspectRatio: react-native-web/g, '')), 'the picture is sized with an explicit width and height, never aspectRatio (react-native-web ignores it)');

  // A THERAPIST-LED ACTIVITY'S PICTURE MUST NOT LEAD THE SCREEN.
  //
  // Stretching is the one activity where the app deliberately describes no technique, because the
  // right stretch for a particular child is the physio's call and the wrong one can hurt. A picture
  // of stretches placed above that deferral would quietly BECOME the instruction — a parent skimming
  // a screen takes the top thing as what to do. So the deferral renders first and the picture after
  // it, carrying a caption that says it is an example and not an instruction.
  //
  // This is asserted against the source because it is an ORDERING rule, which nothing else can catch:
  // the content checks read text, and a picture passes every one of them while defeating their point.
  {
    const leadIdx = screen.indexOf('activity.therapistLedOnly ? (');
    const ledPicture = screen.indexOf('illustration && activity.therapistLedOnly');
    const plainPicture = screen.indexOf('illustration && !activity.therapistLedOnly');
    ok(leadIdx >= 0, 'the therapist-led deferral is still rendered');
    ok(plainPicture >= 0, 'an ordinary activity still leads with its picture');
    ok(ledPicture > leadIdx, "a therapist-led activity's picture renders AFTER the deferral, never before it");
    ok(
      screen.includes('not the ones in this picture'),
      'a therapist-led picture is captioned as an example, never as instructions',
    );
  }

}

// ---- every activity's icon actually has a drawing -------------------------------------------------
// A name with no drawing falls through to the Material glyph set, where these names do not exist —
// so a typo here would render an empty box on a child's screen. Checked against the source text so
// this script stays pure (importing the icons would pull react-native-svg into a node script).
{
  const iconSource = readFileSync(new URL('../src/components/icons/TalkEasyIcons.tsx', import.meta.url), 'utf8');
  for (const a of THERAPY_ACTIVITIES) {
    ok(iconSource.includes(`'${a.icon}'`), `${a.id}: its icon "${a.icon}" is registered in the icon set`);
  }
}

// ---- the practice timer ---------------------------------------------------------------------------
// A GUIDE, not a target. It must count correctly, never run twice, never complete the activity, and
// never say anything a tired child could be pushed on by.
{
  const MIN = 60_000;
  // every activity has a usable default, and the picker can represent it
  for (const a of THERAPY_ACTIVITIES) {
    ok(T.initialTimer(a.suggestedMinutes).minutes === a.suggestedMinutes, `${a.id}: the timer defaults to its suggested ${a.suggestedMinutes} minutes`);
  }
  ok(T.QUICK_MINUTES.join() === '1,3,5,10,15', 'quick options are 1, 3, 5, 10 and 15 minutes');
  ok(T.clampMinutes(0) === 1 && T.clampMinutes(99) === 30 && T.clampMinutes(NaN) === 1, 'a custom length is clamped to 1-30');

  let t = T.initialTimer(5);
  ok(T.formatClock(T.remainingMs(t, 0)) === '05:00', 'idle shows the full length');
  t = T.start(t, 1000);
  ok(T.start(t, 5000) === t, 'Start while running changes nothing, so it cannot add a second countdown');
  ok(T.formatClock(T.remainingMs(t, 1000 + 90_000)) === '03:30', 'time comes from the end moment');
  t = T.pause(t, 1000 + 2 * MIN);
  ok(t.kind === 'paused' && T.remainingMs(t, 999_999_999) === 3 * MIN, 'Pause freezes the remaining time however long it stays paused');
  t = T.resume(t, 50_000_000);
  ok(t.kind === 'running' && T.remainingMs(t, 50_000_000) === 3 * MIN, 'Resume continues from the remaining time');
  ok(T.tick(t, 50_000_000 + 3 * MIN - 1) === t, 'a tick before the end changes nothing');
  ok(T.tick(t, 50_000_000 + 3 * MIN).kind === 'done', 'the timer stops at zero');
  // a phone locked for an hour: the next look still lands on done, never negative
  ok(T.remainingMs(t, 50_000_000 + 60 * MIN) === 0 && T.tick(t, 50_000_000 + 60 * MIN).kind === 'done', 'backgrounded past the end still ends cleanly');
  ok(T.formatClock(1) === '00:01' && T.formatClock(0) === '00:00', 'the clock rounds up and never reads 00:00 early');
  const reset = T.reset(T.pause(T.start(T.initialTimer(7), 0), MIN));
  ok(reset.kind === 'idle' && reset.minutes === 7, 'Reset restores the SELECTED length');
  ok(T.selectMinutes(T.start(T.initialTimer(5), 0), 10).kind === 'running', 'the length cannot change while counting');
  ok(T.selectMinutes(T.initialTimer(5), 10).minutes === 10, 'the length can be changed before starting');

  // words: no dosage, no pressure, and the safety reminder says what it must
  const words = Object.values(T.TIMER_COPY).join(' ');
  for (const re of DOSAGE) ok(!re.test(words), `timer copy carries no dosage (${re})`);
  ok(!/\b(must|have to|need to|hurry|faster|beat|goal|keep going)\b/i.test(words), 'timer copy applies no pressure');
  for (const w of ['close', 'tired', 'pain', 'dizzy', 'unsteady', 'upset']) ok(T.TIMER_COPY.safety.includes(w), `timer safety reminder mentions "${w}"`);
  ok(T.TIMER_COPY.done === 'Practice time is complete!', 'completion message is the friendly one');

  // the wiring, checked on source (this script stays pure)
  const rd = (f: string) => readFileSync(new URL(f, import.meta.url), 'utf8');
  const hook = rd('../src/hooks/useCountdown.ts');
  const comp = rd('../src/components/therapy/TherapyTimer.tsx');
  const scr = rd('../src/screens/child/therapy/TherapyActivityScreen.tsx');
  ok(hook.split('setInterval(').length === 2 && hook.includes('clearInterval'),'exactly one interval, and it is cleared');
  ok(hook.includes('[timer.kind]'), 'the interval is keyed on the timer kind, so it cannot be duplicated');
  ok(hook.includes("AppState.addEventListener") && hook.includes('sub.remove()'), 'the foreground re-read is subscribed and removed');
  ok(!hook.includes('useRecordTherapyPractice') && !comp.includes('useRecordTherapyPractice') && !hook.includes('record(') && !comp.includes('record('), 'the timer cannot record practice, so finishing never completes an activity');
  ok(scr.includes('<TherapyTimer') && scr.includes('defaultMinutes={activity.suggestedMinutes}'), 'the screen passes each activity its own duration');
  ok(scr.includes('!activity.therapistLedOnly ? <TherapyTimer'), 'a therapist-led activity gets no countdown');
  ok(scr.indexOf('<TherapyTimer') > scr.indexOf('<Image') && scr.indexOf('<TherapyTimer') < scr.indexOf('WHAT IT HELPS WITH'), 'the timer sits under the picture and above WHAT IT HELPS WITH');
  ok(!scr.includes('label="Start"') && !scr.includes("'Start'") && !scr.includes('setStarted'), 'the screen has no Start button of its own: the timer is the only Start');
  ok(!comp.includes('onPress={complete}') && scr.includes('onPress={complete}'), 'Done for today is always reachable, so practice can still be recorded');
  ok(scr.includes('WHAT IT HELPS WITH') && scr.includes('safetyNote') && scr.includes('Done for today'), 'the existing cards, safety note and Done button are intact');
}

console.log(`activities ${THERAPY_ACTIVITIES.length}, groups ${GROUPS.length}, goals ${GOALS.length}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
