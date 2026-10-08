// Generates every learning activity at every difficulty many times and checks the questions
// are well-formed (2–4 options, exactly one correct index, no duplicate option labels).
// Run: npm run check:learning
import { LEARNING_SUBJECTS, SUBJECT_LEVELS, createRng, getActivity } from '../src/learning';
import { tierFor } from '../src/learning/levels/bank';
import { OPTION_COUNT } from '../src/learning/engine';
import type { Difficulty } from '../src/types/models';

const DIFFS: Difficulty[] = ['easy', 'medium', 'hard'];
let questions = 0;
let problems = 0;

for (const subject of LEARNING_SUBJECTS) {
  for (const activity of subject.activities) {
    for (const d of DIFFS) {
      for (let run = 0; run < 25; run++) {
        const rng = createRng(run * 7919 + d.length);
        const qs = activity.generate(d, rng);
        if (qs.length === 0) { problems++; console.log('EMPTY', activity.key, d); }
        for (const q of qs) {
          questions++;
          const labels = q.options.map((o) => o.label);
          const issues: string[] = [];
          if (q.options.length < 2 || q.options.length > 4) issues.push(`options=${q.options.length}`);
          if (q.options.length > OPTION_COUNT[d]) issues.push(`more than ${OPTION_COUNT[d]} options for ${d}`);
          if (q.answer < 0 || q.answer >= q.options.length) issues.push(`answer index ${q.answer}`);
          if (new Set(labels).size !== labels.length) issues.push(`duplicate options ${labels.join('|')}`);
          if (!q.prompt.trim()) issues.push('empty prompt');
          if (issues.length) { problems++; console.log('BAD', activity.key, d, issues.join('; '), '::', q.prompt.replace(/\n/g, ' ')); }
        }
      }
    }
  }
}

// ---- the 100 levels of every subject ----
let levelQs = 0;
for (const subject of LEARNING_SUBJECTS) {
  const levels = SUBJECT_LEVELS[subject.key];
  if (levels.length !== 100) { problems++; console.log('LEVELS', subject.key, 'has', levels.length, 'not 100'); }
  const keys = new Set<string>();
  levels.forEach((l, i) => {
    if (l.level !== i + 1) { problems++; console.log('LEVEL ORDER', l.key); }
    if (keys.has(l.key)) { problems++; console.log('DUPLICATE KEY', l.key); }
    keys.add(l.key);
    if (getActivity(l.key) !== l) { problems++; console.log('NOT FOUND BY KEY', l.key); }
    const tier = tierFor(l.step);
    const seen = new Set<string>();
    for (let run = 0; run < 12; run++) {
      const qs = l.generate(tier, createRng(run * 104729 + l.level));
      if (qs.length !== 6) { problems++; console.log('LEVEL SIZE', l.key, qs.length); }
      for (const q of qs) {
        levelQs++;
        seen.add(q.prompt + '|' + (q.promptEmoji ?? '') + '|' + q.options[q.answer]?.label);
        const labels = q.options.map((o) => o.label);
        const issues: string[] = [];
        if (q.options.length < 2 || q.options.length > OPTION_COUNT[tier]) issues.push(`options=${q.options.length} for ${tier}`);
        if (q.answer < 0 || q.answer >= q.options.length) issues.push(`answer index ${q.answer}`);
        if (new Set(labels).size !== labels.length) issues.push(`duplicate options ${labels.join('|')}`);
        if (!q.prompt.trim()) issues.push('empty prompt');
        if (issues.length) { problems++; console.log('BAD LEVEL', l.key, issues.join('; '), '::', q.prompt.replace(/\n/g, ' ')); }
      }
    }
    if (seen.size < 6) { problems++; console.log('LEVEL TOO SAMEY', l.key, seen.size); }
  });
}
console.log(`levels: 5 subjects x 100, level questions checked ${levelQs}`);

console.log(`subjects ${LEARNING_SUBJECTS.length}, activities ${LEARNING_SUBJECTS.reduce((n, s) => n + s.activities.length, 0)}, questions checked ${questions}, problems ${problems}`);
// Show one sample per subject so the content can be eyeballed.
for (const subject of LEARNING_SUBJECTS) {
  const a = subject.activities[0];
  const q = a.generate('medium', createRng(1))[0];
  console.log(`${subject.emoji} ${subject.name} / ${a.title}: "${q.prompt.replace(/\n/g, ' ')}" -> [${q.options.map((o, i) => (i === q.answer ? '*' : '') + o.label).join(', ')}]`);
}
if (problems) process.exit(1);
console.log('ALL OK');
