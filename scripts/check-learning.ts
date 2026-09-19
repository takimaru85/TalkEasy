// Generates every learning activity at every difficulty many times and checks the questions
// are well-formed (2–4 options, exactly one correct index, no duplicate option labels).
// Run: npm run check:learning
import { LEARNING_SUBJECTS, createRng } from '../src/learning';
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

console.log(`subjects ${LEARNING_SUBJECTS.length}, activities ${LEARNING_SUBJECTS.reduce((n, s) => n + s.activities.length, 0)}, questions checked ${questions}, problems ${problems}`);
// Show one sample per subject so the content can be eyeballed.
for (const subject of LEARNING_SUBJECTS) {
  const a = subject.activities[0];
  const q = a.generate('medium', createRng(1))[0];
  console.log(`${subject.emoji} ${subject.name} / ${a.title}: "${q.prompt.replace(/\n/g, ' ')}" -> [${q.options.map((o, i) => (i === q.answer ? '*' : '') + o.label).join(', ')}]`);
}
if (problems) process.exit(1);
console.log('ALL OK');
