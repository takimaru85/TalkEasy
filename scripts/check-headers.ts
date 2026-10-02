// Checks header consistency across child screens. Run: npm run check:headers
//
// THE HEADER IS ONE COMPONENT ALREADY (`ChildScreen` → `ScreenHeader`), so screens cannot drift
// apart by rendering different headers. What they CAN do is drift by passing it different things —
// one screen gives a title and an illustration, the next gives a bare title — and the result looks
// like two apps even though it is one component. That is exactly what had happened to My Collection.
//
// This check holds the standard set by Speech Practice: a section's own screen gives the header a
// TITLE, a SUBTITLE saying what the section is for, and an ILLUSTRATION.
import { readdirSync, readFileSync } from 'node:fs';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

/**
 * The screens a child arrives at from Home or the nav bar — the ones that introduce a section.
 *
 * Deeper screens (one lesson, one activity, one stage) are deliberately NOT listed: they are a step
 * inside something a child already chose, and a subtitle there repeats what the screen above just
 * said. The standard is for the places that need introducing.
 */
const SECTION_SCREENS: { file: string; name: string }[] = [
  { file: 'src/screens/child/CollectionScreen.tsx', name: 'My Collection' },
  { file: 'src/screens/child/ActivitiesScreen.tsx', name: 'Activities' },
  { file: 'src/screens/child/SchoolScreen.tsx', name: 'School' },
  { file: 'src/screens/child/SchoolModeScreen.tsx', name: 'School Mode' },
  { file: 'src/screens/child/MyProgressScreen.tsx', name: 'My Progress' },
  { file: 'src/screens/child/AchievementsScreen.tsx', name: 'Achievements' },
  { file: 'src/screens/child/ChooseAdventureScreen.tsx', name: 'Choose Your Adventure' },
  { file: 'src/screens/child/FeelingsScreen.tsx', name: 'Feelings' },
  { file: 'src/screens/child/MyDayScreen.tsx', name: 'My Day' },
  { file: 'src/screens/child/LearnScreen.tsx', name: 'Play & Learn' },
  { file: 'src/screens/child/CommunicateScreen.tsx', name: 'Talk' },
  { file: 'src/screens/child/FavoritesScreen.tsx', name: 'My Words' },
  { file: 'src/screens/child/speech/SpeechPracticeScreen.tsx', name: 'Speech Practice (the reference)' },
  { file: 'src/screens/child/voice/VoiceCommHomeScreen.tsx', name: 'Listen & Talk' },
  { file: 'src/screens/child/adaptive/AdaptiveHomeScreen.tsx', name: 'Lessons' },
  { file: 'src/screens/child/adaptive/WritingPracticeScreen.tsx', name: 'Learn & Trace' },
  { file: 'src/screens/child/therapy/TherapyHomeScreen.tsx', name: 'Therapy' },
  { file: 'src/screens/child/scan/ScanAssignmentScreen.tsx', name: 'Scan Assignment' },
];

/**
 * Routes that must be openable from somewhere inside the app.
 *
 * Deliberately a SHORT, explicit list rather than every route in the navigator: plenty of routes
 * are reached by a parameterised push or from a component rather than a screen, and a check that
 * guessed would cry wolf until somebody deleted it. These are the section screens whose only door
 * has been, or could easily become, a single line in one file.
 */
const ROUTES_THAT_NEED_A_DOOR = ['SchoolMode', 'School', 'Activities', 'Calendar', 'ScanAssignment'];

/** Every .tsx under a directory, as [path, source]. */
function globSource(dir: string): [string, string][] {
  const out: [string, string][] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...globSource(full));
    else if (entry.name.endsWith('.tsx')) out.push([full, readFileSync(full, 'utf8')]);
  }
  return out;
}

/**
 * Every opening `<ChildScreen ...>` tag in a file.
 *
 * A screen may render more than one — Activities opens a single activity from the same file, and
 * Therapy puts the safety notice in front of its hub — so the section's own header is often not the
 * first tag. The standard is met when ONE of them meets it.
 */
function headerTags(source: string): string[] {
  const tags: string[] = [];
  let from = 0;
  for (;;) {
    // SpeechPracticeLayout is ChildScreen plus the galaxy backdrop and forwards the same header props.
    const a = source.indexOf('<ChildScreen', from);
    const b = source.indexOf('<SpeechPracticeLayout', from);
    const start = a < 0 ? b : b < 0 ? a : Math.min(a, b);
    if (start < 0) break;
    const end = source.indexOf('>', start);
    if (end < 0) break;
    tags.push(source.slice(start, end));
    from = end + 1;
  }
  return tags;
}

for (const { file, name } of SECTION_SCREENS) {
  let source: string;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    ok(false, `${name}: ${file} is missing — update this list if the screen moved`);
    continue;
  }

  const tags = headerTags(source);
  ok(tags.length > 0, `${name}: uses the shared ChildScreen header`);
  if (tags.length === 0) continue;

  // The section's own header is the one that meets the standard; a detail view in the same file
  // does not have to.
  const full = tags.filter(
    (t) => t.includes('title=') && t.includes('subtitle=') && (t.includes('art=') || t.includes('emoji=')),
  );
  ok(
    full.length > 0,
    `${name}: no header gives a title, a SUBTITLE and an illustration — the Speech Practice standard`,
  );
}

// ---- nobody rolls their own header ------------------------------------------------------------------
// A child screen reaching for ScreenHeader directly would bypass the adventure zone, the Home button
// and the shared spacing — which is how a one-off header gets built without anyone deciding to.
for (const { file, name } of SECTION_SCREENS) {
  let source: string;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  ok(!source.includes('<ScreenHeader'), `${name}: does not build its own header`);
}

// ---- a section screen a child cannot reach is not a section -----------------------------------------
// This file already lists the screens that INTRODUCE a section, which makes it the place that knows
// which screens have to be reachable. The check exists because of a real near-miss: School Mode was
// opened from exactly ONE place in the whole app, a quiet bar on the Home screen, and removing that
// bar as redundant would have stranded the screen -- along with Scan Assignment, which lives inside
// it -- with no error, no warning and nothing to see. The route stays registered, so nothing fails
// to compile; the screen simply has no door.
//
// A route is reachable when some OTHER screen navigates to it. `initialRouteName` does not count:
// Parent Mode's "start in School Mode" setting decides where the app OPENS, not where a child can
// go mid-session, and a screen you can only arrive at by relaunching the app is not reachable.
{
  const screens = globSource('src/screens');
  for (const route of ROUTES_THAT_NEED_A_DOOR) {
    // TWO shapes count as a door, because the app genuinely has two. Most screens push a literal
    // (`navigate('SchoolMode')`); Home's explore row instead holds a TABLE of destinations and
    // presses them with `go(m.screen)`, so the route name appears as `screen: 'School'` and no
    // literal navigate call for it exists anywhere. A check that only knew the first shape would
    // have called the explore row a missing entry point, which is how a correct check gets deleted.
    const doors = screens.filter(
      ([file, src]) =>
        !file.endsWith(`${route}Screen.tsx`) &&
        (src.includes(`navigate('${route}'`) || src.includes(`screen: '${route}'`)),
    );
    ok(doors.length > 0, `${route}: no screen navigates to it -- the section has no entry point`);
  }
}

// ---- Parent Mode stays plain, on purpose --------------------------------------------------------------
// AGENTS.md: Parent Mode builds on ScreenContainer/ScreenHeader WITHOUT the adventure zone, so a
// child can tell at a glance which part of the app they are in. Giving it the child header would
// erase that distinction, so this asserts the separation rather than the sameness.
{
  const parent = readFileSync('src/screens/parent/SettingsScreen.tsx', 'utf8');
  ok(!parent.includes('<ChildScreen'), 'Parent Mode does not use the child header — the two must look different');
}

console.log(`section screens ${SECTION_SCREENS.length}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
