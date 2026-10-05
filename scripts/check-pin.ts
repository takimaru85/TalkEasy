import { createHash } from 'node:crypto';
import { LOCKOUT_MS, MAX_ATTEMPTS, hasPin, isWeakPin, makePinRecord, needsUpgrade, sha256Hex, verifyPin } from '../src/services/pin';

let bad = 0;
const ok = (cond: unknown, msg: string) => {
  if (!cond) {
    bad++;
    console.error('FAIL', msg);
  } else console.log('ok  ', msg);
};

ok(sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'SHA-256 matches the published test vector');
for (const s of ['', 'a', '0123:4567', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'x'.repeat(200)]) {
  ok(sha256Hex(s) === createHash('sha256').update(s).digest('hex'), `SHA-256 matches node:crypto for length ${s.length}`);
}

ok(!hasPin('') && !hasPin(undefined) && !hasPin(null), 'no stored value means no PIN yet');
ok(!hasPin('1234'), 'the old factory default PIN counts as no PIN');
ok(hasPin('4821') && needsUpgrade('4821') && !needsUpgrade('1234'), 'a custom legacy PIN still works and is queued for upgrade');
ok(!hasPin('abcd') && !hasPin('12345'), 'garbage is not a PIN');

let n = 0;
const seq = () => {
  n = (n * 7 + 3) % 16;
  return n / 16;
};
const rec = makePinRecord('4821', seq);
ok(/^h1:[0-9a-f]{16}:[0-9a-f]{64}$/.test(rec) && !rec.includes('4821'), 'a new PIN is stored as a salted hash, never the digits');
ok(hasPin(rec) && !needsUpgrade(rec), 'a hashed PIN counts as set and needs no upgrade');
ok(verifyPin('4821', rec) && !verifyPin('4822', rec) && !verifyPin('', rec) && !verifyPin('48210', rec), 'only the right PIN opens a hashed record');
ok(makePinRecord('4821', Math.random) !== makePinRecord('4821', Math.random), 'two records of the same PIN use different salts');
ok(verifyPin('4821', '4821') && !verifyPin('1111', '4821'), 'a legacy plain PIN still verifies');
ok(!verifyPin('1234', '1234') && !verifyPin('1234', '') && !verifyPin('0000', undefined), 'the old default and an empty store never verify');
ok(isWeakPin('1234') && isWeakPin('0000') && isWeakPin('7777') && !isWeakPin('4821') && !isWeakPin('1212'), 'weak PINs are the old default and repeated digits');
ok(MAX_ATTEMPTS >= 3 && LOCKOUT_MS >= 10_000, 'a short lockout follows repeated wrong entries');

if (bad) {
  console.error(`${bad} PIN check(s) failed`);
  process.exit(1);
}
console.log('ALL OK');
