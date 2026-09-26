// Checks the Adaptive Learning answer engine and demo content. Run: npm run check:adaptive
import { acceptedAnswers, choicesForLevel, matchesFreeAnswer, normalizeAnswer, orderedMethods } from '../src/adaptive/answers';
import { DEMO_LESSONS } from '../src/adaptive/demoLessons';
import { WRITING_LEVELS } from '../src/adaptive/handwriting';
import type { LessonActivity } from '../src/adaptive/types';
import { SCHOOL_GLYPHS, SINGLE_STOREY_A } from '../src/adaptive/schoolGlyphs';
import { layoutSchoolText } from '../src/adaptive/schoolText';
import { CAP_HEIGHT, LETTER_STROKES, strokesFor } from '../src/adaptive/strokeOrder';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

ok(normalizeAnswer('Ten.') === '10', 'ten -> 10');
ok(normalizeAnswer('  Sun-light!! ') === 'sun light', 'punctuation stripped');
ok(matchesFreeAnswer('Plants need sunlight to grow.', ['sunlight']), 'sentence contains answer');
ok(matchesFreeAnswer('ten', ['10']), 'number word equals digit');
ok(!matchesFreeAnswer('sun', ['sunlight']), 'partial word does not match');
ok(matchesFreeAnswer('Sampu', ['10']), 'Filipino number word');
ok(!matchesFreeAnswer('', ['10']), 'empty never matches');

const act: LessonActivity = {
  id: 1, lessonId: 1, type: 'mcq', question: 'q', image: null,
  choices: [{ label: 'A', correct: true }, { label: 'B', correct: false }, { label: 'C', correct: false }, { label: 'D', correct: false }],
  pairs: [], answers: [], hint: '', difficulty: 'easy', allowedMethods: ['tap', 'speak', 'type', 'write', 'assisted'], sortOrder: 0,
};
ok(choicesForLevel(act.choices, 'guided').length === 2, 'guided = 2 choices');
ok(choicesForLevel(act.choices, 'assisted').length === 3, 'assisted = 3 choices');
ok(choicesForLevel(act.choices, 'independent').length === 4, 'independent = all');
ok(choicesForLevel(act.choices, 'guided').some((c) => c.correct), 'correct choice always kept');
ok(orderedMethods(act, null, 'guided')[0] === 'tap', 'guided leads with tap');
ok(orderedMethods(act, 'speak', 'guided')[0] === 'speak', 'preferred method first');
ok(orderedMethods(act, null, 'independent')[0] === 'type', 'independent leads with type');
ok(!orderedMethods({ ...act, choices: [] }, null, 'guided').includes('tap'), 'tap removed when no choices');
ok(acceptedAnswers(act).includes('A'), 'correct choice label is an accepted answer');

for (const d of DEMO_LESSONS) {
  ok(d.activities.length > 0, `${d.lesson.title}: has activities`);
  for (const a of d.activities) {
    ok(a.allowedMethods.length > 0, `${a.question}: allowed methods`);
    ok(!(a.allowedMethods.length === 1 && a.allowedMethods[0] === 'write'), `${a.question}: writing is never the only method`);
    if (a.type === 'mcq' || a.type === 'picture') ok(a.choices.some((c) => c.correct), `${a.question}: has a correct choice`);
    if (a.type === 'matching') ok(a.pairs.length >= 2, `${a.question}: pairs`);
    if (a.type === 'typing' || a.type === 'speaking') ok(acceptedAnswers({ ...a, id: 0, lessonId: 0, sortOrder: 0 }).length > 0, `${a.question}: accepted answers`);
  }
}
// Letter outlines: the tracing guide draws these, so every character a level can show must
// exist. The default map is plain Nunito (US English keeps its ordinary double-storey "a");
// the Filipino single-storey form is a separate glyph, built on the width of "o".
ok(!!SCHOOL_GLYPHS['a'], 'default a glyph is present');
ok(SINGLE_STOREY_A.a === SCHOOL_GLYPHS['o'].a, 'single-storey a is built on the width of o');
ok(SINGLE_STOREY_A.d !== SCHOOL_GLYPHS['a'].d, 'the two letterforms really differ');
for (const lvl of WRITING_LEVELS) {
  for (const item of lvl.items) {
    const text = item.guide.kind === 'text' ? item.guide.text : '';
    for (const ch of [...text, ...(item.model ?? '')]) ok(SCHOOL_GLYPHS[ch], `level ${lvl.level}: glyph for "${ch}"`);
  }
}
// ---- stroke-order arrows -------------------------------------------------------------
// The arrows are positioned by mapping normalised stroke coordinates through the glyph's own
// advance and CAP_HEIGHT, so if the font is ever regenerated with different metrics every arrow
// silently lands in the wrong place. Re-measure it from the "H" outline instead of trusting it.
const hYs = (SCHOOL_GLYPHS['H'].d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).filter((_, i) => i % 2 === 1);
ok(Math.abs(-Math.min(...hYs) - CAP_HEIGHT) <= 2, `CAP_HEIGHT ${CAP_HEIGHT} still matches the H outline (${-Math.min(...hYs)})`);

// Every character a level asks the child to trace needs an arrow, or it is the only one on the
// board with no guidance.
for (const lvl of WRITING_LEVELS) {
  for (const item of lvl.items) {
    if (item.guide.kind !== 'text') continue;
    for (const ch of item.guide.text) {
      if (ch === ' ') continue;
      ok(strokesFor(ch), `level ${lvl.level}: stroke order for "${ch}"`);
    }
  }
}

for (const [ch, strokes] of Object.entries(LETTER_STROKES)) {
  ok(strokes.length > 0 && strokes.length <= 4, `"${ch}": between 1 and 4 strokes`);
  strokes.forEach((s, i) => {
    ok(s.points.length >= 2, `"${ch}" stroke ${i + 1}: at least two points`);
    ok(
      s.points.every(([x, y]) => x >= -0.1 && x <= 1.1 && y >= -0.1 && y <= 1.35),
      `"${ch}" stroke ${i + 1}: points stay inside the glyph box`,
    );
    // A zero-length first segment would leave the arrow with no direction to point in.
    const [[x0, y0], [x1, y1]] = [s.points[0], s.points[1]];
    ok(Math.hypot(x1 - x0, y1 - y0) > 0.01, `"${ch}" stroke ${i + 1}: has a direction`);
  });
}

const lay = layoutSchoolText('cat', 500, 200);
ok(lay.glyphs.length === 3 && lay.width > 0 && lay.scale > 0, 'layoutSchoolText lays out cat');
ok(lay.glyphs.map((g) => g.ch).join('') === 'cat', 'layout reports each glyph character, for the arrows');
ok(lay.glyphs.every((g) => g.adv > 0), 'layout reports each advance, for the arrows');
ok(layoutSchoolText('', 500, 200).glyphs.length === 0, 'empty text is safe');
// English must be untouched by the Filipino letterform, and only "a" may differ between them.
const enCat = layoutSchoolText('cat', 500, 200, 'standard');
const filCat = layoutSchoolText('cat', 500, 200, 'single-storey');
ok(enCat.glyphs[0].d === filCat.glyphs[0].d && enCat.glyphs[2].d === filCat.glyphs[2].d, 'c and t are identical in both styles');
ok(enCat.glyphs[1].d !== filCat.glyphs[1].d, 'only the a differs');
ok(layoutSchoolText('cat', 500, 200).glyphs[1].d === enCat.glyphs[1].d, 'default letter style is standard (US English)');

ok(WRITING_LEVELS.length === 7 && WRITING_LEVELS.every((l, i) => l.level === i + 1 && l.items.length > 0), 'seven writing levels with items');

console.log(`demo lessons ${DEMO_LESSONS.length}, activities ${DEMO_LESSONS.reduce((n, d) => n + d.activities.length, 0)}, writing items ${WRITING_LEVELS.reduce((n, l) => n + l.items.length, 0)}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
