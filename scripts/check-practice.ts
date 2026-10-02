// Checks every practice area. Run: npm run check:practice
//
// This section carries more risk than anything else in TalkEasy: it is about how a child's voice
// works, which is exactly the territory where an app can start sounding like a clinician. These
// assertions are the guardrails — they fail the build if the feature drifts towards assessment,
// towards diagnosis, or towards teaching an intonation "rule" that is not true.
import { readFileSync } from 'node:fs';
import { PRACTICE_ACTIVITIES, PRACTICE_AREAS, PRACTICE_CONTENT } from '../src/practice/content';
import { buildExercises, getActivity, linesOf, voiceOptional } from '../src/practice/engine';
import { MAX_SESSION_EXERCISES, buildSession, sessionSeed } from '../src/practice/session';
import { segmentsFor } from '../src/practice/voiceShape';
import { PRACTICE_AREA_IDS, type PracticeAreaId } from '../src/practice/types';
import { THEMES } from '../src/adventure/themes';
import { WORLD_IDS } from '../src/adventure/worlds';
import { en } from '../src/i18n/locales/en';
import type { Strings } from '../src/i18n/types';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const glyphs: Record<string, number> = require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');
const s = en.strings;

// ---- Structure ---------------------------------------------------------------------------------
ok(PRACTICE_AREAS.length === PRACTICE_AREA_IDS.length, 'every declared area has a definition');
for (const id of PRACTICE_AREA_IDS) {
  const cat = PRACTICE_AREAS.find((c) => c.id === id);
  ok(!!cat, `area "${id}" is defined`);
  if (!cat) continue;
  ok(cat.icon in glyphs, `area "${id}": icon "${cat.icon}" exists in the glyphmap`);
  ok(!!s[cat.titleKey] && !!s[cat.subtitleKey], `area "${id}": has a title and a subtitle`);
  ok(PRACTICE_ACTIVITIES.some((a) => a.category === id), `area "${id}" has at least one activity`);
}

const ids = new Set<string>();
for (const a of PRACTICE_ACTIVITIES) {
  ok(!ids.has(a.id), `activity id "${a.id}" is unique`);
  ids.add(a.id);
  ok(a.icon in glyphs, `activity "${a.id}": icon "${a.icon}" exists in the glyphmap`);
  ok(!!s[a.titleKey] && !!s[a.subtitleKey], `activity "${a.id}": has a title and a subtitle`);
  ok(PRACTICE_AREA_IDS.includes(a.category), `activity "${a.id}": belongs to a real area`);

  // ---- Every activity has content, and every exercise works ----------------------------------
  const exercises = buildExercises(a.id);
  ok(exercises.length > 0, `activity "${a.id}" has exercises`);

  for (const ex of exercises) {
    // ACCESSIBILITY, and the rule this section is built on: a child who cannot speak must still be
    // able to do every activity. If this ever fails, the feature has excluded the children it is for.
    ok(voiceOptional(ex), `"${a.id}" / "${ex.id}": can be completed without speaking`);

    // Every line must produce something audible — a shape that fell through to silence is a
    // button a child presses while nothing happens.
    for (const l of linesOf(ex)) {
      ok(l.text.trim().length > 0, `"${a.id}" / "${ex.id}": line "${l.id}" has text`);
      ok(segmentsFor(l).length > 0, `"${a.id}" / "${ex.id}": line "${l.id}" produces audible segments`);
      if (l.focusWord !== undefined) {
        const words = (l.speak ?? l.text).split(/\s+/);
        ok(l.focusWord >= 0 && l.focusWord < words.length, `"${a.id}" / "${ex.id}": focusWord is inside "${l.text}"`);
      }
    }

    switch (ex.kind) {
      case 'listen-choose': {
        ok(!!s[ex.promptKey], `"${ex.id}": prompt string exists`);
        ok(ex.choices.length >= 2, `"${ex.id}": at least two choices`);
        ok(ex.answerIds.length > 0, `"${ex.id}": has an expected answer`);
        const choiceIds = new Set(ex.choices.map((c) => c.id));
        for (const id of ex.answerIds) ok(choiceIds.has(id), `"${ex.id}": answer "${id}" is one of the choices`);
        // Exactly one label source: an interface word from the strings, or practice content's own
        // English. Both or neither means the label shown is not the one that was intended.
        for (const c of ex.choices) {
          const viaKey = !!c.labelKey && !!s[c.labelKey];
          const viaText = !!c.text?.trim();
          ok(viaKey !== viaText, `"${ex.id}": choice "${c.id}" has exactly one label`);
        }
        // Ordered answers must be distinct, or "tap them in order" has no order to follow.
        if (ex.ordered) {
          ok(new Set(ex.answerIds).size === ex.answerIds.length, `"${ex.id}": ordered answers are distinct`);
        }
        break;
      }
      case 'wait-go': {
        ok(ex.waits.length >= 2, `"${ex.id}": at least two rounds`);
        // The wait GROWS — that is the exercise — but never so far that it becomes a punishment.
        for (let i = 1; i < ex.waits.length; i++) {
          ok(ex.waits[i] > ex.waits[i - 1], `"${ex.id}": round ${i + 1} waits longer than the one before`);
        }
        ok(Math.max(...ex.waits) <= 4000, `"${ex.id}": the longest wait stays under four seconds`);
        break;
      }
      case 'beat': {
        ok(ex.beats >= 2 && ex.beats <= 5, `"${ex.id}": between two and five beats`);
        // Slow enough to count. A fast gap would turn this into a reaction test.
        ok(ex.gapMs >= 450, `"${ex.id}": beats are at least 450ms apart`);
        break;
      }
      case 'copy-action': {
        ok(!!ex.picture.trim(), `"${ex.id}": has a picture of the action`);
        // A gentler option is what makes this reachable for a child who cannot make the movement.
        if (ex.gentlerKey) ok(!!s[ex.gentlerKey], `"${ex.id}": the gentler option's string exists`);
        break;
      }
      case 'say-more': {
        ok(!!s[ex.promptKey], `"${ex.id}": prompt string exists`);
        ok(ex.rungs.length >= 2 && ex.rungs.length <= 4, `"${ex.id}": two to four rungs`);
        ok(!!ex.picture.trim(), `"${ex.id}": has a picture`);
        // Shortest first. A ladder whose rungs are not ordered is not a ladder, and the view draws
        // them by length.
        for (let i = 1; i < ex.rungs.length; i++) {
          ok(
            ex.rungs[i].text.split(/\s+/).length >= ex.rungs[i - 1].text.split(/\s+/).length,
            `"${ex.id}": rung ${i + 1} is at least as long as the one before`,
          );
        }
        break;
      }
      case 'arrange': {
        ok(!!s[ex.promptKey], `"${ex.id}": prompt string exists`);
        ok(ex.words.length >= 3 && ex.words.length <= 6, `"${ex.id}": three to six words`);
        ok(ex.words.every((w) => w.trim().length > 0), `"${ex.id}": no empty words`);
        break;
      }
      case 'voice-try':
        ok(!!s[ex.cueKey], `"${ex.id}": cue string exists`);
        break;
      case 'focus-say': {
        ok(ex.readings.length > 0, `"${ex.id}": has a reading`);
        ok(!!s[ex.cueKey], `"${ex.id}": cue string exists`);
        // A focus activity whose readings carry no focus word is not a focus activity.
        ok(ex.readings.every((r) => r.focusWord !== undefined), `"${ex.id}": every reading marks its strong word`);
        if (ex.question) {
          ok(!!s[ex.question.promptKey], `"${ex.id}": question prompt exists`);
          // The expected answer has to be the word actually spoken with prominence, or the
          // activity teaches the child to distrust their own ears.
          const expected = `w${ex.readings[0].focusWord}`;
          ok(
            ex.question.answerIds.includes(expected),
            `"${ex.id}": expected answer matches the reading's focus word (${expected})`,
          );
        }
        break;
      }
      case 'turn-light':
        ok(ex.ideas.length >= 2, `"${ex.id}": at least two ideas to tap`);
        // Never a race. A short amber would turn turn-taking into a reaction test.
        ok(ex.readyMs >= 1200, `"${ex.id}": the "get ready" pause is at least 1.2s`);
        break;
      case 'exchange': {
        ok(!!s[ex.titleKey], `"${ex.id}": title string exists`);
        ok(ex.turns.length >= 2, `"${ex.id}": a conversation needs at least two turns`);
        // Turns must alternate — two turns in a row from the same speaker is not turn-taking.
        for (let i = 1; i < ex.turns.length; i++) {
          ok(ex.turns[i].who !== ex.turns[i - 1].who, `"${ex.id}": turn ${i + 1} changes speaker`);
        }
        break;
      }
    }
  }
}

// Content with no activity pointing at it is content a child can never reach.
for (const key of Object.keys(PRACTICE_CONTENT)) {
  ok(ids.has(key), `content "${key}" belongs to a declared activity`);
}

// ---- The developmental order, asserted --------------------------------------------------------
// The whole premise of these areas is that looking, listening and understanding come BEFORE
// talking, and that hearing a sound comes before producing it. That ordering is not a suggestion
// the content happens to follow — it is the thing being built, so it is checked.
const areaOrder = PRACTICE_AREA_IDS.indexOf.bind(PRACTICE_AREA_IDS);
ok(areaOrder('attention') < areaOrder('expressive'), 'Listen & Attention comes before Talking & Language');
ok(areaOrder('early') < areaOrder('expressive'), 'Early Communication comes before Talking & Language');
ok(areaOrder('understanding') < areaOrder('expressive'), 'Understanding comes before Talking & Language');
ok(areaOrder('sounds') < areaOrder('conversation'), 'Speech Sounds comes before Conversation');

// Inside Speech Sounds, listening is the first rung and everything else follows in order.
const ladder = PRACTICE_ACTIVITIES.filter((a) => a.category === 'sounds').map((a) => a.id);
ok(ladder[0] === 'soundListen', 'the Speech Sounds ladder starts with listening, not producing');
const expected = ['soundListen', 'soundSay', 'soundSyllable', 'soundWord', 'soundPhrase', 'soundSentence', 'soundChat'];
ok(ladder.join(',') === expected.join(','), 'the Speech Sounds ladder runs sound -> syllable -> word -> phrase -> sentence -> chat');

// Every area a child can open has to have something in it.
for (const id of PRACTICE_AREA_IDS) {
  const acts = PRACTICE_ACTIVITIES.filter((a) => a.category === id);
  ok(acts.length > 0, `area "${id}" has activities`);
  ok(acts.every((a) => buildExercises(a.id).length > 0), `every activity in "${id}" has exercises`);
}

// ---- A session stays SHORT, and opens with something that needs no speech ---------------------
// The reason short daily practice works is that it ends while the child is still enjoying it, so
// the cap is asserted rather than trusted. A session that quietly grew to twenty exercises would
// still "work" and would still be the wrong product.
for (let day = 0; day < 40; day++) {
  const plan = buildSession(20000 + day);
  const where = `session seed ${20000 + day}`;

  ok(plan.steps.length >= 3, `${where}: has a warm-up, an activity and some practice`);
  ok(plan.totalExercises <= MAX_SESSION_EXERCISES, `${where}: at most ${MAX_SESSION_EXERCISES} exercises`);
  ok(plan.estimatedMinutes <= 10, `${where}: estimated at ten minutes or less`);
  ok(plan.estimatedMinutes >= 2, `${where}: long enough to be worth opening`);

  // The first step is ALWAYS a warm-up, and always from an area that needs no voice.
  ok(plan.steps[0]?.kind === 'warmup', `${where}: starts with a warm-up`);
  const first = getActivity(plan.steps[0]?.activityId ?? '');
  ok(
    first !== undefined && (first.category === 'attention' || first.category === 'early'),
    `${where}: the warm-up is listening or joining in, not production`,
  );

  // No activity twice in one session, and every step has exercises behind it.
  const seen = new Set<string>();
  for (const step of plan.steps) {
    ok(!seen.has(step.activityId), `${where}: "${step.activityId}" appears once`);
    seen.add(step.activityId);
    ok(step.count > 0, `${where}: "${step.activityId}" runs at least one exercise`);
    ok(step.count <= buildExercises(step.activityId).length, `${where}: "${step.activityId}" does not ask for more exercises than it has`);
    ok(voiceOptional(buildExercises(step.activityId)[0]), `${where}: "${step.activityId}" can be done without speaking`);
  }
}

// The same day always gives the same plan — leaving and coming back must continue the session,
// not reshuffle it.
const seed = sessionSeed(new Date(2026, 9, 1, 9, 30));
ok(
  JSON.stringify(buildSession(seed)) === JSON.stringify(buildSession(seed)),
  'a session plan is stable for a given day',
);
ok(sessionSeed(new Date(2026, 9, 1, 8)) === sessionSeed(new Date(2026, 9, 1, 22)), 'the seed holds all day');
ok(sessionSeed(new Date(2026, 9, 1)) !== sessionSeed(new Date(2026, 9, 2)), 'the seed changes the next day');

// ---- One design system, two layouts ----------------------------------------------------------
// Listen & Talk and Speech Practice are allowed DIFFERENT LAYOUTS - a pathway of full-width cards
// against a grid of tiles - because the two things are shaped differently. They are not allowed
// different design systems. These screens drifted apart once already, by hand-rolling their own
// cards instead of using the shared ones, so the rule is checked rather than remembered.
const SHARED_SCREENS = [
  'src/screens/child/voice/VoiceCommHomeScreen.tsx',
  'src/screens/child/voice/VoiceAreaScreen.tsx',
  'src/screens/child/voice/PracticeSessionScreen.tsx',
];
for (const file of SHARED_SCREENS) {
  const src = readFileSync(file, "utf8");
  ok(/MissionCard/.test(src), file + ": uses the shared MissionCard, not its own row");
  ok(/ChildScreen/.test(src), file + ": uses the shared ChildScreen header");
  // A borderRadius or a shadow in a screen is the start of a second design system.
  ok(!/borderRadius:/.test(src), file + ": declares no radius of its own (the card owns it)");
  ok(!/shadowOpacity:/.test(src), file + ": declares no shadow of its own");
}

// ---- A theme may dress a prompt, never change the exercise ------------------------------------
// "Your dinosaur's turn!" is the same turn-taking exercise as "Your turn!". Every theme has to
// supply a companion, or the prompt falls back mid-sentence in whichever world forgot one.
for (const id of WORLD_IDS) {
  const companion = THEMES[id].companion;
  ok(!!companion?.trim(), `theme "${id}" names the child's companion`);
  ok(!/[A-Z]/.test(companion ?? ''), `theme "${id}" companion is lower case (it sits mid-sentence)`);
}

// ---- The words this feature may never say ------------------------------------------------------
// TalkEasy is a practice app. It does not assess, diagnose, score or norm anything, and no string
// anywhere in it may suggest otherwise — to a child or to a parent reading over their shoulder.
const BANNED = [
  'diagnos', 'disorder', 'therapy', 'therapist', 'clinical', 'clinician', 'assessment',
  'impair', 'deficit', 'delay', 'abnormal', 'severity', 'symptom', 'patient', 'treatment',
  'incorrect', 'wrong', 'failed', 'failure',
];
/**
 * A banned word is allowed when it is being DENIED — "this is not an assessment" is the sentence
 * that keeps a parent from assuming it is one, and banning it outright would delete the disclaimer
 * rather than the risk. Only a negated use survives; describing a child with the word does not.
 *
 * Alternatives are longest-first on purpose: with "a" before "an", "not an assessment" consumes
 * only "not an" and leaves the very word being checked for behind.
 */
function withoutDenials(text: string): string {
  return text.replace(/\b(?:not|never|no)\s+(?:an|a|the)?\s*[a-z]*/g, ' ');
}

const stringKeys = Object.keys(s) as (keyof Strings)[];
for (const key of stringKeys.filter((k) => String(k).startsWith('vc'))) {
  const value = withoutDenials(String(s[key]).toLowerCase());
  for (const word of BANNED) {
    ok(!value.includes(word), `string "${String(key)}" avoids clinical language ("${word}")`);
  }
}

// The same rule for the practice content itself and for the parent-facing home ideas.
const contentSource = readFileSync('src/practice/content.ts', 'utf8').toLowerCase();
for (const word of BANNED) {
  // "wrong" appears in a comment explaining that nothing is ever marked wrong, so comments are
  // stripped before the check rather than exempting the word.
  const stripped = contentSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  ok(!stripped.includes(word), `content avoids clinical language ("${word}")`);
}

// ---- The two intonation claims that would be false ---------------------------------------------
// English questions do not all rise, and one pitch pattern does not mean one fixed feeling. Both
// activities exist to let a child HEAR the difference, never to teach a rule.
const qs = PRACTICE_CONTENT.questionStatement ?? [];
const asked = qs.filter((e) => e.kind === 'listen-choose');
ok(
  asked.some((e) => e.kind === 'listen-choose' && e.answerIds.includes('asking')) &&
    asked.some((e) => e.kind === 'listen-choose' && e.answerIds.includes('telling')),
  'Question or Statement teaches both answers, not "questions rise"',
);
const heard = PRACTICE_CONTENT.whatDidYouHear ?? [];
const sameWords = new Set(heard.flatMap((e) => (e.kind === 'listen-choose' ? e.listen.map((l) => l.text) : [])));
ok(sameWords.size < heard.length, 'What Did You Hear reuses the same words with different voices');

const totals = `${PRACTICE_AREAS.length} areas, ${PRACTICE_ACTIVITIES.length} activities, ${PRACTICE_ACTIVITIES.reduce((n, a) => n + buildExercises(a.id).length, 0)} exercises`;
console.log(problems === 0 ? `Practice areas OK — ${totals}` : `${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
