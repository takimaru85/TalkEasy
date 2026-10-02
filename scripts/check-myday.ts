// Checks the live My Day schedule logic at the moments that matter. Run: npm run check:myday
//
// The example day is the one from the design brief: School 8:00, Lunch 12:00, Homework 15:00,
// Play 16:00, Dinner 19:00, Bedtime 20:30, plus two untimed morning steps.
import { computeDay, startsIn, toMinutes } from '../src/myday/schedule';
import type { RoutineItem } from '../src/types/models';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

let id = 0;
const step = (label: string, startTime: string | null, extra: Partial<RoutineItem> = {}): RoutineItem => ({
  id: ++id, routineId: 1, label, icon: 'star', sortOrder: id, isDone: false, isSkipped: false,
  startTime, segment: 'morning', notes: '', endTime: null, linkedActivity: null, ...extra,
});
const at = (hhmm: string, sec = 0) => { const m = toMinutes(hhmm)!; return new Date(2026, 9, 1, Math.floor(m / 60), m % 60, sec); };

const day = () => [
  step('Wake up', null), step('Brush teeth', null),
  step('School', '08:00'), step('Lunch', '12:00', { endTime: '12:30' }), step('Homework', '15:00'),
  step('Play', '16:00'), step('Dinner', '19:00'), step('Bedtime', '20:30'),
];

// Early morning: the untimed steps before School are done in order; NEXT follows the sequence.
{
  const s = computeDay(day(), at('07:00'));
  ok(s.now?.item.label === 'Wake up', '07:00 NOW is the first untimed step');
  ok(s.next?.item.label === 'Brush teeth' && s.minutesUntilNext === null, '07:00 NEXT is Brush teeth, "after this"');
  const items = day(); items[0].isDone = true; items[1].isDone = true;
  const t2 = computeDay(items, at('07:00'));
  ok(t2.now?.item.label === 'School' && t2.minutesUntilNow === 60 && t2.next?.item.label === 'Lunch', '07:00 morning done: advances to NOW School (in 60 min), NEXT Lunch');
}
// An untimed step is not suggested outside its place in the day.
{
  const items = [step('Wake up', '06:30'), step('Brush teeth', null), step('Breakfast', '07:00'), step('School', '08:00'), step('Lunch', '12:00')];
  ok(computeDay(items, at('06:40')).next?.item.label === 'Brush teeth', '06:40 Brush teeth is NEXT after Wake up');
  const noon = computeDay(items, at('12:00'));
  ok(noon.now?.item.label === 'Lunch' && noon.entries[1].status === 'missed', '12:00 NOW Lunch; un-ticked Brush teeth is past, not suggested');
}
// Dinner NOW → NEXT is Bath (the next step in the day), not Bedtime.
{
  const items = [step('Dinner', '18:00'), step('Bath', null), step('Relax', null), step('Bedtime', '20:00')];
  const s = computeDay(items, at('18:20'));
  ok(s.now?.item.label === 'Dinner' && s.next?.item.label === 'Bath', '18:20 NOW Dinner, NEXT Bath');
  items[0].isDone = true;
  const s2 = computeDay(items, at('18:40'));
  ok(s2.now?.item.label === 'Bath' && s2.next?.item.label === 'Relax', '18:40 Dinner done: NOW Bath, NEXT Relax');
  items[1].isDone = true; items[2].isDone = true;
  const s3 = computeDay(items, at('19:50'));
  ok(s3.now?.item.label === 'Bedtime' && s3.minutesUntilNow === 10 && s3.next === null, '19:50 NOW Bedtime in 10 min, nothing after');
}
// 11:30 — NOW School, NEXT Lunch in 30 minutes ("soon").
{
  const items = day(); items[0].isDone = true; items[1].isDone = true;
  const s = computeDay(items, at('11:30'));
  ok(s.now?.item.label === 'School' && s.now.status === 'current', '11:30 NOW School');
  ok(s.next?.item.label === 'Lunch' && s.minutesUntilNext === 30 && s.nextPhase === 'soon', '11:30 NEXT Lunch, 30 min, soon');
  ok(s.itsTime === null, '11:30 not "it\'s time" (School started long ago)');
}
// 11:45 — up next; 11:56 — almost.
{
  const items = day(); items[0].isDone = true; items[1].isDone = true;
  ok(computeDay(items, at('11:45')).nextPhase === 'upNext', '11:45 phase upNext');
  ok(computeDay(items, at('11:56')).nextPhase === 'almost', '11:56 phase almost');
  ok(computeDay(items, at('11:45', 30)).minutesUntilNext === 15, '11:45:30 rounds UP to 15 minutes');
}
// 12:00 — IT'S TIME for Lunch; next is Homework.
{
  const items = day(); items[0].isDone = true; items[1].isDone = true; items[2].isDone = true;
  const s = computeDay(items, at('12:00'));
  ok(s.now?.item.label === 'Lunch' && s.itsTime?.item.label === 'Lunch', '12:00 IT\'S TIME Lunch');
  ok(s.next?.item.label === 'Homework', '12:00 NEXT Homework');
  ok(computeDay(items, at('12:20')).itsTime === null, '12:20 the "it\'s time" moment has passed');
}
// 12:30 — Lunch done: the schedule ADVANCES — NOW Homework (at 15:00), NEXT Play.
{
  const items = day(); [0, 1, 2, 3].forEach((i) => (items[i].isDone = true));
  const s = computeDay(items, at('12:30'));
  ok(s.now?.item.label === 'Homework' && s.minutesUntilNow === 150, '12:30 NOW advances to Homework, 150 min away');
  ok(s.next?.item.label === 'Play', '12:30 NEXT Play');
  ok(s.itsTime === null, '12:30 not "it\'s time" yet');
  ok(s.done === 4 && s.total === 8, '12:30 4 of 8 done');
  ok(computeDay(items, at('15:00')).itsTime?.item.label === 'Homework', '15:00 IT\'S TIME Homework');
}
// The brief's example: Play done at 16:30 → NOW Dinner (18:00), NEXT the step after.
{
  const items = [step('Play', '16:00'), step('Dinner', '18:00'), step('Homework', '19:00')];
  items[0].isDone = true;
  const s = computeDay(items, at('16:30'));
  ok(s.now?.item.label === 'Dinner' && s.next?.item.label === 'Homework' && s.minutesUntilNow === 90, '16:30 NOW Dinner (in 90 min), NEXT Homework');
}
// Lunch not ticked by 12:40: its own end time (12:30) passed — missed, not nagged.
{
  const items = day(); [0, 1, 2].forEach((i) => (items[i].isDone = true));
  const s = computeDay(items, at('12:40'));
  ok(s.entries[3].status === 'missed' && s.now?.item.label === 'Homework', '12:40 un-ticked Lunch is missed; NOW moves on to Homework');
}
// Skipped steps are never NEXT.
{
  const items = day(); [0, 1, 2, 3].forEach((i) => (items[i].isDone = true)); items[4].isSkipped = true;
  const s = computeDay(items, at('13:00'));
  ok(s.now?.item.label === 'Play' && s.next?.item.label === 'Dinner' && s.entries[4].status === 'skipped', 'skipped Homework → NOW Play, NEXT Dinner');
}
// Everything done or skipped.
{
  const items = day(); items.forEach((i) => (i.isDone = true)); items[7].isDone = false; items[7].isSkipped = true;
  ok(computeDay(items, at('21:00')).allDone, 'all done (one skipped) → allDone');
}
// A routine with no times at all behaves like the old My Day.
{
  const items = [step('A', null), step('B', null), step('C', null)]; items[0].isDone = true;
  const s = computeDay(items, at('10:00'));
  ok(s.now?.item.label === 'B' && s.next?.item.label === 'C' && s.minutesUntilNext === null, 'untimed: NOW B, NEXT C');
}
ok(startsIn(1) === 'Starts in 1 minute' && startsIn(15) === 'Starts in 15 minutes' && startsIn(60) === 'Starts in 1 hour' && startsIn(90) === 'Starts in 1½ hours' && startsIn(118) === 'Starts in 2 hours', 'startsIn wording (no seconds, half hours)');

ok(startsIn(55, true) === 'Starts in 55 min' && startsIn(60, true) === 'Starts in 1 hr' && startsIn(90, true) === 'Starts in 1½ hrs', 'short countdown (Home)');

console.log(problems ? `${problems} problem(s)` : 'My Day schedule OK');
process.exit(problems ? 1 : 0);
