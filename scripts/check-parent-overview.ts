// Parent Practice overview wording rules (pure). Run: npm run check:parent-overview
import { CAREGIVER_TIPS, PRACTICE_VS_PROGRESS, SUPPLEMENT_NOTICE, isEmptyHistory, overviewSentence, suggestionSentence } from '../src/adventure/parentOverview';

const fails: string[] = [];
const eq = (l: string, g: unknown, w: unknown) => { if (g !== w) fails.push(`${l}: got ${g}, want ${w}`); };
const zero = { words: 0, sounds: 0, speechExercises: 0, tracingSessions: 0 };

eq('empty history', isEmptyHistory(zero), true);
eq('exercises alone are history', isEmptyHistory({ ...zero, speechExercises: 1 }), false);
eq('empty sentence is invitation, no zeros', /No practice has been recorded yet/.test(overviewSentence(zero)), true);
eq('singular', overviewSentence({ ...zero, words: 1 }), 'So far TalkEasy has recorded 1 different word practised.');
eq('list', overviewSentence({ words: 3, sounds: 2, speechExercises: 9, tracingSessions: 1 }), 'So far TalkEasy has recorded 3 different words, 2 different sounds and 1 tracing session practised.');
eq('exercises only', overviewSentence({ ...zero, speechExercises: 4 }), 'So far TalkEasy has recorded 4 speech exercises.');
eq('no suggestion text is graceful', /no suggested session/.test(suggestionSentence(0, 0)), true);
eq('suggestion is optional', /optional/.test(suggestionSentence(5, 6)), true);

// Tone: nothing may pressure, shame or promise outcomes, and the disclaimer must be present.
const all = [overviewSentence({ words: 5, sounds: 5, speechExercises: 5, tracingSessions: 5 }), overviewSentence(zero), suggestionSentence(5, 6), ...CAREGIVER_TIPS, PRACTICE_VS_PROGRESS].join(' ');
eq('no streak / failure language', /streak|behind|fail|lost|must|should have|you need to|score|grade/i.test(all), false);
eq('disclaimer names the professional', /qualified speech-language professional/.test(SUPPLEMENT_NOTICE), true);
eq('says it is not real-world evidence', /not a test/.test(PRACTICE_VS_PROGRESS), true);

if (fails.length) { console.error('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('Parent overview OK');
