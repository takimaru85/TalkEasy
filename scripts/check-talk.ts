// Checks the Talk sentence engine. Run: npm run check:talk
import { DEFAULT_BUTTONS } from '../src/constants/defaults';
import { generatePhrase, isStarterPhrase, readTile } from '../src/talk/phraseEngine';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const tile = (label: string) => {
  const b = DEFAULT_BUTTONS.find((x) => x.label === label && !isStarterPhrase(x.phrase));
  if (!b) throw new Error(`no default tile ${label}`);
  return b;
};
const say = (starter: string, label: string, phrase?: string) =>
  generatePhrase({ starter, label, phrase: phrase ?? tile(label).phrase });

// ---- The cases that must hold (I want + …) -----------------------------------------------------
const WANT: [string, string[]][] = [
  ['Water', ['I want water.']],
  ['Help', ['I need help.', 'I want help.']],
  ['Hungry', ['I am hungry.']],
  ['Thirsty', ['I am thirsty.']],
  ['Tired', ['I am tired.']],
  ['Happy', ['I am happy.']],
  ['Sad', ['I am sad.']],
  ['Bathroom', ['I need the bathroom.']],
  ['Snack', ['I want a snack.']],
  ['Egg', ['I want an egg.']],
  ['Mom', ['I want Mom.']],
  ['Play', ['I want to play.']],
  ['Pain', ['I am in pain.']],
  ['Sick', ['I feel sick.']],
  ['Yes', ['Yes.']],
  ['More', ['More, please.']],
];
for (const [label, want] of WANT) {
  const p = say('I want...', label);
  ok(want.includes(p.text), `I want + ${label} → ${want.join(' / ')} (got "${p.text}")`);
  ok(p.text === p.speech, `I want + ${label}: what is shown is what is spoken`);
}
// A grown-up's bare word tile keeps working, in sentence case.
ok(say('I want...', 'Toy', 'Toy').text === 'I want toy.', 'bare "Toy" tile → "I want toy."');
ok(say('I want...', 'Toy', 'I want a toy.').text === 'I want a toy.', 'a tile phrased "I want a toy." keeps its article');
ok(say('I want...', 'Ball', 'I want the ball.').text === 'I want the ball.', '"the ball" keeps its article');

// ---- Every default tile, after every starter: never nonsense ---------------------------------
const STATE_LIKE = /^I (?:want|need|like|don't like) (?:hungry|thirsty|tired|happy|sad|angry|scared|excited|okay|full|hot|cold|wet|sick|in pain|hurt|ready|finished)\.$/i;
const starters = ['I want...', 'I need...', 'I feel...', 'I am...', 'I like...', "I don't like...", 'Can I have...', 'Can you get me...'];
for (const starter of starters) {
  for (const b of DEFAULT_BUTTONS) {
    if (isStarterPhrase(b.phrase)) continue;
    const p = generatePhrase({ starter, label: b.label, phrase: b.phrase });
    const where = `${starter} + ${b.category}/${b.label}`;
    ok(!STATE_LIKE.test(p.text), `${where}: no "want + state" nonsense (got "${p.text}")`);
    ok(!/\b(I want|I need) I\b/i.test(p.text) && !/\bI'm\b.*\bI'm\b/.test(p.text), `${where}: no doubled subject (got "${p.text}")`);
    ok(/^[A-Z]/.test(p.text) && /[.!?]$/.test(p.text) && !/\.\.$/.test(p.text), `${where}: one punctuated sentence (got "${p.text}")`);
    ok(!/\b(?:want|need|like|have) [A-Z][a-z]/.test(p.text) || /\b(Mom|Dad|Mum|TV)\b/.test(p.text), `${where}: sentence casing, not title case (got "${p.text}")`);
    ok(p.text === p.speech, `${where}: shown == spoken`);
  }
}

// ---- Roles are read from the phrase, not the label ---------------------------------------------
ok(readTile('Hungry', "I'm hungry.").role === 'state', 'Hungry is a state');
ok(readTile('Water', 'I want water.').role === 'thing', 'Water is a thing');
ok(readTile('Help', 'I need help.').role === 'need', 'Help is a need');
ok(readTile('Play', 'I want to play.').role === 'activity', 'Play is an activity');
ok(readTile('Yes', 'Yes.').role === 'sentence', 'Yes stands on its own');
ok(readTile('Scared', "I'm scared. Stay with me.").role === 'sentence', 'two sentences are said as written');
ok(say('I feel...', 'Happy').text === 'I feel happy.', 'I feel + Happy → I feel happy.');
ok(say('I need...', 'Water').text === 'I need water.', 'I need + Water → I need water.');
ok(say("I don't like...", 'Music').text === "I don't like to listen to music.", "I don't like + Music");

console.log(problems === 0 ? `Talk sentences OK — ${DEFAULT_BUTTONS.length} tiles x ${starters.length} starters` : `${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
