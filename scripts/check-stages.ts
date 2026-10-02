// Checks the Speech Practice ladder. Run: npm run check:stages
//
// The old screen listed twenty activities at once and several of them were not speech production
// at all. This check is what stops that coming back: every activity must live in EXACTLY ONE
// place — a ladder stage, or a Listen & Talk area — and the ladder must stay in order.
import { readFileSync } from 'node:fs';
import { ACTIVITIES } from '../src/speechpractice/activities';
import { MOVED_TO_PRACTICE, SPEECH_STAGES, SPEECH_STAGE_IDS, getStage, visibleMembers } from '../src/speechpractice/stages';
import { STAGE_TILE_COLORS, stageTileRows, stageTileWidth, tileColorFor } from '../src/speechpractice/stageArt';
import { ACTIVITIES } from '../src/speechpractice/activities';
import { getActivity as getPracticeActivity } from '../src/practice/engine';
import { en } from '../src/i18n/locales/en';
import { PRACTICE_ACTIVITIES, PRACTICE_AREAS } from '../src/practice/content';
import { PRACTICE_AREA_IDS } from '../src/practice/types';
import { Adventure } from '../src/theme/adventure';
import { en } from '../src/i18n/locales/en';
import { SOUND_TARGETS, TARGET_STEPS, TARGET_STEP_DEFS, stepItemKeys } from '../src/speechpractice/targets';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const s = en.strings;
const glyphs: Record<string, number> = require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');

// ---- The ladder itself -------------------------------------------------------------------------
ok(SPEECH_STAGES.length === 5, 'five stages, no more — the screen exists to be short');
ok(
  SPEECH_STAGES.map((x) => x.id).join(',') === SPEECH_STAGE_IDS.join(','),
  'the stages are declared in ladder order',
);
ok(
  SPEECH_STAGE_IDS.join(',') === 'sounds,syllables,words,phrases,sentences',
  'the ladder runs sounds -> syllables -> words -> phrases -> sentences',
);

const colours = new Set<string>();
for (const stage of SPEECH_STAGES) {
  ok(!!s[stage.titleKey] && !!s[stage.subtitleKey], `stage "${stage.id}": has a title and a subtitle`);
  ok(stage.icon in glyphs, `stage "${stage.id}": icon "${stage.icon}" exists in the glyphmap`);
  ok(stage.color in Adventure, `stage "${stage.id}": colour "${stage.color}" is a real palette colour`);
  // One colour family per stage. Two stages sharing one would undo the point of the grouping.
  ok(!colours.has(stage.color), `stage "${stage.id}": colour "${stage.color}" is not reused by another stage`);
  colours.add(stage.color);
  ok(stage.members.length >= 2, `stage "${stage.id}": has at least two activities`);
  ok(visibleMembers(stage, new Set()).length === stage.members.length, `stage "${stage.id}": nothing hidden by default`);
  ok(getStage(stage.id) === stage, `stage "${stage.id}": getStage finds it`);
}

// ---- Every activity lives in exactly one place -------------------------------------------------
const inStages = new Map<string, string>();
for (const stage of SPEECH_STAGES) {
  for (const m of stage.members) {
    const key = `${m.module}:${m.id}`;
    ok(!inStages.has(key), `"${key}" appears in one stage only (also in "${inStages.get(key)}")`);
    inStages.set(key, stage.id);

    if (m.module === 'speech') {
      ok(ACTIVITIES.some((a) => a.id === m.id), `stage "${stage.id}": "${m.id}" is a real Speech Practice activity`);
      ok(MOVED_TO_PRACTICE[m.id] === undefined, `"${m.id}" is either in a stage or moved away, never both`);
    } else {
      ok(PRACTICE_ACTIVITIES.some((a) => a.id === m.id), `stage "${stage.id}": "${m.id}" is a real practice activity`);
    }
  }
}

// Nothing may be stranded: every Speech Practice activity is in a stage or has an area to move to.
for (const a of ACTIVITIES) {
  const staged = inStages.has(`speech:${a.id}`);
  const moved = MOVED_TO_PRACTICE[a.id] !== undefined;
  ok(staged || moved, `"${a.id}" is reachable — in a stage, or moved to a Listen & Talk area`);
  ok(!(staged && moved), `"${a.id}" is in one place only`);
}

// Every destination area is a real one.
for (const [id, area] of Object.entries(MOVED_TO_PRACTICE)) {
  ok(PRACTICE_AREA_IDS.includes(area!), `"${id}" moved to a real area ("${area}")`);
}

// ---- The duplication this whole change exists to remove ----------------------------------------
// The sound ladder in `src/practice` IS these stages. It must not also be listed as its own area
// on the Listen & Talk hub, or the same activities appear in two sections again.
const ladderArea = PRACTICE_AREAS.find((a) => a.id === 'sounds');
ok(ladderArea?.ownedElsewhere === true, 'the practice module\'s sound-ladder area is owned by Speech Practice');
const ladderActivities = PRACTICE_ACTIVITIES.filter((a) => a.category === 'sounds').map((a) => a.id);
for (const id of ladderActivities) {
  ok(inStages.has(`practice:${id}`), `ladder activity "${id}" is reachable from a Speech Practice stage`);
}

// ---- The screens ------------------------------------------------------------------------------
const home = readFileSync('src/screens/child/speech/SpeechPracticeScreen.tsx', 'utf8');
// The home screen lists STAGES. If it starts mapping ACTIVITIES again it has become a dashboard.
ok(/SPEECH_STAGES/.test(home), 'the Speech Practice home lists stages');
ok(!/LEVELS\.map/.test(home), 'the Speech Practice home no longer lists every activity by level');
ok(/MissionCard/.test(home), 'the Speech Practice home uses the shared MissionCard');
ok(!/borderRadius:/.test(home), 'the Speech Practice home declares no radius of its own');

// The redesign changed the LOOK. Which stages show, what is locked behind Plus, what each counts and where
// each goes are exactly what they were, and the two numbers in the banner are counted, not typed.
ok(home.includes('visibleMembers(stage, hidden).length'), 'each stage still shows its real, visible activity count');
ok(home.includes("can('speechPractice', i).allowed") && home.includes("navigate('Plus')"), 'the Plus lock is unchanged: a locked stage explains Plus');
ok(home.includes("navigate('SpeechStage', { stageId: stage.id })"), 'a stage still opens its own activities');
ok(home.includes('adventure.totalStars') && home.includes('stats.activitiesCompleted'), 'the banner counts are the real total stars and today\'s finished activities');
ok(
  home.includes('value={String(adventure.totalStars)}') && home.includes('value={String(stats.activitiesCompleted)}'),
  'each banner number IS the counted value, not a number written in',
);
ok(home.includes('STAGE_ART[stage.id]'), 'each stage wears the illustration for its id');
ok((home.match(/navigate\('ParentPin'\)/g) ?? []).length === 1 && home.includes('onSettings={openParentMode}') && home.includes('onPress={openParentMode}'), 'settings and Grown-ups share ONE door: the existing Parent PIN');
ok(home.includes('<SpeechPracticeLayout'), 'the main screen uses the shared Speech Practice layout');
const layout = readFileSync('src/components/adventure/SpeechPracticeLayout.tsx', 'utf8');
ok(layout.indexOf('<GalaxyFooter />') >= 0 && layout.indexOf('<GalaxyFooter />') < layout.indexOf('<ScrollView'), 'the shared layout puts the backdrop before the content, so the content paints over it');
// ---- The tile grid: the same design on every stage, at every width ------------------------------------------
const TITLE = (m: { module: string; id: string }): string => {
  const key = m.module === 'practice' ? (getPracticeActivity(m.id) as any)?.titleKey : (ACTIVITIES.find((a) => a.id === m.id) as any)?.titleKey;
  return (en.strings as any)[key] ?? m.id;
};
for (const stage of SPEECH_STAGES) {
  const colours = STAGE_TILE_COLORS[stage.id];
  ok(colours.length >= Math.min(3, stage.members.length), `${stage.id}: the palette has enough colours for its first tiles`);
  for (let i = 0; i + 1 < stage.members.length; i++) {
    ok(tileColorFor(stage.id, i) !== tileColorFor(stage.id, i + 1), `${stage.id}: tiles ${i} and ${i + 1} are not the same colour`);
  }
  for (const width of [320, 360, 375, 390, 430, 768, 1024]) {
    for (const columns of width >= 700 ? [2, 4] : [2]) {
      const rows = stageTileRows(stage.members.length, width - 32, columns);
      ok(rows.reduce((a, b) => a + b, 0) === stage.members.length, `${stage.id} @${width}/${columns}: every tile is placed exactly once (${rows.join("+")})`);
      ok(rows.every((n) => n >= 1 && n <= 4), `${stage.id} @${width}/${columns}: no row is empty or wider than four`);
      for (const perRow of rows) {
        const tw = stageTileWidth(width - 32, perRow, 12);
        for (const m of stage.members) {
          // the longest word at 11pt (the smallest the tile will shrink to), with the 0.64em glyph estimate fitText uses
          const longest = Math.max(...TITLE(m).split(' ').map((w: string) => w.length));
          if (perRow >= 3) ok(longest * 0.64 * 11 <= tw - 16, `${stage.id} @${width}: "${TITLE(m)}" fits a ${tw}pt tile in a row of ${perRow}`);
        }
      }
    }
  }
}
ok(stageTileRows(5, 390).join() === '3,2' && stageTileRows(5, 320).join() === '2,2,1', 'five tiles are three over two, dropping to twos on a narrow phone');
const stageScreen = readFileSync('src/screens/child/speech/SpeechStageScreen.tsx', 'utf8');
ok(stageScreen.includes('<SpeechPracticeLayout'), 'every stage uses the shared Speech Practice layout');
ok(stageScreen.includes('colorKey={tileColorFor(stage.id, index)}') && stageScreen.includes('colorArt={ACTIVITY_ART[member.id]}'), 'every tile wears its own colour and its own illustration');
ok(stageScreen.includes('navigate(\'VoiceActivity\'') && stageScreen.includes('navigate(\'SpeechActivity\'') && stageScreen.includes('navigate(activity.route)'), 'every tile still opens the screen it always did');
ok(/GameTile/.test(stageScreen), 'a stage shows its activities as a grid of shared GameTiles');
ok(/sizes\.gridColumns/.test(stageScreen), 'the stage grid uses the shared responsive column count');

// ---- The target journey ------------------------------------------------------------------------
// One target, six steps, one screen. This is what makes "what am I practising?" answerable, so the
// shape of it is checked: every syllable the chips offer must have a target behind it, or a child
// taps BA and lands nowhere.
for (const target of SOUND_TARGETS) {
  ok(/^[a-z]+$/.test(target.id), target.id + ": id is a plain lower-case key");
  ok(target.display === target.display.toUpperCase(), target.id + ": display is upper case");
  ok(target.words.length === 3, target.id + ": has three practice words");
  ok(target.others.length === 2, target.id + ": has two non-target words for the game");
  ok(target.phrase.trim().length > 0, target.id + ": has a phrase");
  ok(target.sentence.trim().length > 0, target.id + ": has a sentence");
  // The phrase and sentence must actually contain a target word, or the rung practises nothing.
  const inPhrase = target.words.some((w) => target.phrase.toLowerCase().includes(w.text.toLowerCase()));
  const inSentence = target.words.some((w) => target.sentence.toLowerCase().includes(w.text.toLowerCase()));
  ok(inPhrase, target.id + ": the phrase uses one of its words");
  ok(inSentence, target.id + ": the sentence uses one of its words");
  // A game whose wrong answers start with the target would have no answer.
  for (const other of target.others) {
    ok(!target.words.some((w) => w.text === other.text), target.id + ": game distractors are not target words");
  }
  ok(stepItemKeys(target.id).length === TARGET_STEPS.length, target.id + ": one log key per step");
  ok(new Set(stepItemKeys(target.id)).size === TARGET_STEPS.length, target.id + ": log keys are distinct");
}
ok(TARGET_STEPS.join(",") === "listen,say,words,phrase,sentence,play", "the target journey runs listen -> say -> words -> phrase -> sentence -> play");
ok(TARGET_STEP_DEFS.length === TARGET_STEPS.length, "every step has a definition");
for (const d of TARGET_STEP_DEFS) {
  ok(!!s[d.titleKey] && !!s[d.cueKey], "step " + d.id + ": has a title and a cue");
}
console.log(
  problems === 0
    ? `Speech ladder OK — 5 stages, ${inStages.size} activities, ${Object.keys(MOVED_TO_PRACTICE).length} moved, ${SOUND_TARGETS.length} targets x ${TARGET_STEPS.length} steps`
    : `${problems} problem(s)`,
);
process.exit(problems === 0 ? 0 : 1);
