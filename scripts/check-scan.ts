// Checks Scan Assignment. Run: npm run check:scan
//
// The flow has a lot of ways to go wrong — a refused camera, a blurry page, an engine that is not
// in this build — and the rules below are the ones that keep it usable anyway: there is always a way
// to get the words in, the text the engine read is never destroyed, and the app never answers the
// homework.
import { readFileSync } from 'node:fs';
import { imageOf, failureMessage, initialScanState, isBusy, scanReducer, type ScanEvent } from '../src/scan/machine';
import { describeType, parseAssignment } from '../src/scan/parser';
import { normalizeScanLanguage, scriptFor, SCAN_LANGUAGES } from '../src/scan/language';
import type { ScanFailure, ScanState } from '../src/scan/types';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const run = (events: ScanEvent[], from: ScanState = initialScanState): ScanState =>
  events.reduce(scanReducer, from);

const FAILURES: ScanFailure[] = ['engineUnavailable', 'noText', 'engineError', 'noCamera'];

// ---- the happy path --------------------------------------------------------------------------------
{
  const s = run([
    { type: 'photoTaken', imageUri: 'file://a.jpg' },
    { type: 'usePhoto' },
    { type: 'ocrDone', text: 'Write the names of the following animals:\n1. Dog\n2. Cat\n3. Bird', confident: true },
  ]);
  ok(s.kind === 'ocrSuccess', 'a confident read lands on success');
  const r = scanReducer(s, { type: 'review' });
  ok(r.kind === 'review', 'and goes on to review');
  ok(r.kind === 'review' && r.text.includes('Dog'), 'carrying the text with it');
  const saved = scanReducer(r, { type: 'saved', assignmentId: 7 });
  ok(saved.kind === 'saved' && saved.assignmentId === 7, 'and can be saved');
}

// ---- a low-confidence read is NEVER presented as a success ------------------------------------------
{
  const s = run([
    { type: 'photoTaken', imageUri: 'file://a.jpg' },
    { type: 'usePhoto' },
    { type: 'ocrDone', text: 'sm thing', confident: false },
  ]);
  ok(s.kind === 'ocrPartial', 'an unconfident read is partial, not success');
  ok(scanReducer(s, { type: 'review' }).kind === 'review', 'a partial read still opens the editor');
}

// ---- nothing usable is a FAILURE, not an empty success -----------------------------------------------
// An empty editor after a scan tells a parent it worked when it did not.
for (const empty of ['', '   ', '\n\n']) {
  const s = run([
    { type: 'photoTaken', imageUri: 'file://a.jpg' },
    { type: 'usePhoto' },
    { type: 'ocrDone', text: empty, confident: true },
  ]);
  ok(s.kind === 'ocrFailed', `empty text (${JSON.stringify(empty)}) is a failure, not a success`);
  ok(s.kind === 'ocrFailed' && s.reason === 'noText', 'and says there was no text');
}

// ---- THERE IS ALWAYS A WAY TO TYPE IT IN -------------------------------------------------------------
// The single most important rule here: recognition fails for ordinary reasons, and a parent who
// cannot get the words in has no feature at all.
for (const reason of FAILURES) {
  const failed = run([
    { type: 'photoTaken', imageUri: 'file://a.jpg' },
    { type: 'usePhoto' },
    { type: 'ocrFailed', reason },
  ]);
  ok(failed.kind === 'ocrFailed', `${reason}: reaches the failure state`);
  const manual = scanReducer(failed, { type: 'enterManually' });
  ok(manual.kind === 'review', `${reason}: manual entry is reachable`);
  ok(manual.kind === 'review' && manual.text === '', `${reason}: manual entry starts empty`);

  const msg = failureMessage(reason);
  ok(msg.title.length > 0 && msg.body.length > 0, `${reason}: has something to say`);
  ok(/type|choose a photo|library/i.test(msg.body), `${reason}: the message offers a way forward`);
  ok(!/\byou (did|failed|should have)\b/i.test(msg.body), `${reason}: never blames the parent`);
}
// ...and from a cold start too, which is the "Type it in instead" button on the intro screen.
ok(scanReducer(initialScanState, { type: 'enterManually' }).kind === 'review', 'manual entry works from idle');

// ---- events that do not apply are IGNORED, never half-applied -----------------------------------------
ok(scanReducer(initialScanState, { type: 'usePhoto' }).kind === 'idle', 'using a photo that was never taken does nothing');
ok(scanReducer(initialScanState, { type: 'review' }).kind === 'idle', 'reviewing nothing does nothing');
ok(
  scanReducer({ kind: 'processing', imageUri: 'f' }, { type: 'usePhoto' }).kind === 'processing',
  'a second tap on "Use photo" cannot start a second recognition',
);
ok(
  scanReducer({ kind: 'idle' }, { type: 'ocrDone', text: 'x', confident: true }).kind === 'idle',
  'a late recognition result cannot resurrect an abandoned scan',
);
ok(scanReducer({ kind: 'idle' }, { type: 'editText', text: 'x' }).kind === 'idle', 'editing outside review does nothing');

// ---- retake and reset ---------------------------------------------------------------------------------
ok(scanReducer({ kind: 'processing', imageUri: 'f' }, { type: 'retake' }).kind === 'idle', 'retake goes back to the start');
ok(scanReducer({ kind: 'review', imageUri: 'f', text: 'x' }, { type: 'reset' }).kind === 'idle', 'reset clears the flow');
ok(
  scanReducer({ kind: 'review', imageUri: 'f', text: 'a' }, { type: 'editText', text: 'b' }),
  'the editor can change the text',
);
{
  const edited = scanReducer({ kind: 'review', imageUri: 'f', text: 'a' }, { type: 'editText', text: 'b' });
  ok(edited.kind === 'review' && edited.text === 'b', 'an edit is kept');
  ok(edited.kind === 'review' && edited.imageUri === 'f', 'and the photo survives it');
}

// ---- helpers --------------------------------------------------------------------------------------------
ok(isBusy({ kind: 'processing', imageUri: 'f' }), 'processing is busy');
ok(!isBusy({ kind: 'review', imageUri: null, text: '' }), 'review is not busy');
ok(!isBusy(initialScanState), 'idle is not busy');
ok(imageOf({ kind: 'processing', imageUri: 'f' }) === 'f', 'the photo is findable while processing');
ok(imageOf(initialScanState) === null, 'idle has no photo');

// ---- the parser NEVER changes the text --------------------------------------------------------------------
{
  const samples = [
    'Write the names of the following animals:\n1. Dog\n2. Cat\n3. Bird',
    'Spell the following words:\n1. house\n2. water\n3. friend',
    '2 + 3 = ___\n10 - 4 = ___\n5 x 2 = ___',
    'Read the passage below and answer the questions that follow about the water cycle in nature.',
    '',
    '   \n  \n',
    'aaa',
  ];
  for (const text of samples) {
    const before = text;
    const parsed = parseAssignment(text);
    ok(text === before, 'parseAssignment does not mutate its input');
    ok(parsed.content === text.trim() || parsed.content === text, `the original text survives parsing: ${JSON.stringify(text.slice(0, 20))}`);
    ok(typeof parsed.canMakeActivity === 'boolean', 'canMakeActivity is always decided');
    ok(describeType(parsed.type).length > 0, 'every type has a description');
  }
}

// ---- classification ------------------------------------------------------------------------------------------
{
  const vocab = parseAssignment('Write the names of the following animals:\n1. Dog\n2. Cat\n3. Bird');
  ok(vocab.type === 'vocabulary', 'a short numbered list is vocabulary');
  ok(vocab.items.length === 3 && vocab.items[0] === 'Dog', 'the list markers are stripped');
  ok(vocab.canMakeActivity, 'three clean words is enough to offer an activity');

  const spelling = parseAssignment('Spell the following words:\n1. house\n2. water\n3. friend');
  ok(spelling.type === 'spelling', 'a spelling instruction wins over the generic list');
  ok(spelling.canMakeActivity, 'three single words can become spelling practice');

  const math = parseAssignment('2 + 3 = ___\n10 - 4 = ___\n5 x 2 = ___');
  ok(math.type === 'math', 'sums are recognised without any words at all');
  ok(math.items.length === 3, 'each sum is an item');

  const reading = parseAssignment('Read the passage below and answer the questions that follow about the water cycle.');
  ok(reading.type === 'reading', 'prose is reading');
  ok(!reading.canMakeActivity, 'reading never becomes an auto-generated activity');

  const unknown = parseAssignment('aaa');
  ok(unknown.type === 'unknown', 'a scrap is unknown');
  ok(!unknown.canMakeActivity, 'and never becomes an activity');
  ok(parseAssignment('').type === 'unknown', 'empty is unknown');
  ok(parseAssignment('   ').canMakeActivity === false, 'whitespace never becomes an activity');
}

// ---- the parser never ANSWERS the homework --------------------------------------------------------------------
// It may list what is on the page; it may not work it out. A wrong answer in a child's homework is
// worse than no answer, and it costs their teacher the chance to see what they actually knew.
{
  const math = parseAssignment('2 + 3 = ___\n10 - 4 = ___\n5 x 2 = ___');
  const joined = `${math.items.join(' ')} ${math.content} ${math.title} ${math.instructions}`;
  for (const answer of ['= 5', '= 6', '= 10', 'answer:', 'solution']) {
    ok(!joined.toLowerCase().includes(answer.toLowerCase()), `maths parsing never supplies "${answer}"`);
  }
  const src = readFileSync('src/scan/parser.ts', 'utf8');
  ok(!/\beval\b|Function\(/.test(src), 'the parser does not evaluate expressions');
}

// ---- language ---------------------------------------------------------------------------------------------------
ok(SCAN_LANGUAGES[0].tag === '' && SCAN_LANGUAGES[0].label === 'English', 'English is the first and default choice');
ok(SCAN_LANGUAGES.length >= 2, 'more than one language is offered');
ok(normalizeScanLanguage('es-ES') === 'es-ES', 'a Spanish scan keeps its tag');
ok(normalizeScanLanguage('fil-PH') === '', 'the removed Filipino tag falls back to English');
ok(normalizeScanLanguage('nonsense') === '', 'an unknown language falls back to the app voice');
ok(scriptFor('') === 'Latin' && scriptFor('es-ES') === 'Latin', 'every current language uses the Latin recogniser');
ok(scriptFor('nonsense') === 'Latin', 'an unknown language still gets a usable script');

// ---- privacy: nothing leaves the device, and the text is never logged ------------------------------------------
{
  const ocr = readFileSync('src/services/ocr.ts', 'utf8');
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'axios', 'WebSocket', 'https://', 'http://', 'apiKey', 'API_KEY']) {
    ok(!ocr.includes(forbidden), `the OCR service contains no "${forbidden}" — a child's schoolwork never leaves the device`);
  }
  // The recognised text must never reach a log, in any build.
  const logs = ocr.match(/console\.(log|warn|error)\([^)]*\)/g) ?? [];
  for (const line of logs) {
    ok(!/text|result|raw/i.test(line), `a log line must not carry recognised text: ${line}`);
  }
  // Availability must be decided from React Native's own registry, never by asking the package:
  // its entry point substitutes a Proxy that THROWS on any property access when the native half is
  // missing, so probing it in Expo Go would take the screen down instead of degrading.
  ok(ocr.includes('NativeModules?.TextRecognition'), 'availability is probed safely, without touching the package');
  ok(!/^import .*@react-native-ml-kit/m.test(ocr), 'the package is never imported at module scope');
  ok(ocr.includes('isTextRecognitionAvailable()'), 'recognition is gated on availability');

  const hook = readFileSync('src/hooks/useScanAssignment.ts', 'utf8');
  ok(!/console\.(log|warn|error)/.test(hook), 'the scan hook logs nothing');
  const review = readFileSync('src/screens/child/scan/ScanReviewScreen.tsx', 'utf8');
  ok(!/console\.(log|warn|error)/.test(review), 'the review screen logs nothing');
  // Read Aloud must go through the shared, language-aware path — never a second TTS implementation.
  ok(review.includes('speakContent'), 'Read Aloud uses the shared language-aware speech path');
  ok(!review.includes("from 'expo-speech'"), 'the review screen does not reach for the engine directly');
}

// ---- the original text is never overwritten by an edit -----------------------------------------------------------
{
  const repo = readFileSync('src/database/repositories/assignmentsRepo.ts', 'utf8');
  const update = repo.slice(repo.indexOf('async update('), repo.indexOf('async setStatus('));
  ok(update.includes('UPDATE assignments SET'), 'the update statement was found');
  ok(!update.includes('scan_text = ?'), 'editing an assignment never overwrites the text the engine read');
  ok(repo.includes('scan_text'), 'the scanned text is stored');
}

console.log(`states checked, failures ${FAILURES.length}, languages ${SCAN_LANGUAGES.length}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
