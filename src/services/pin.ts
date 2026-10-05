/**
 * The Parent PIN: first-run setup, a salted hash instead of plain text, and a pure check.
 * No react-native, no storage, no dependencies, so `check:pin` can run it in Node.
 *
 * STORED VALUE (the `parentPin` setting):
 *   ''                no PIN yet: Parent Mode asks the grown-up to create one before it opens;
 *   'h1:<salt>:<hex>' a salted, iterated SHA-256 of the PIN (never the PIN itself);
 *   '1234'            a LEGACY plain-text value from an older build. The old factory default (1234)
 *                     counts as "no PIN" so the family must choose one; any other legacy PIN still
 *                     works and is upgraded to a hash the next time it is entered correctly.
 *
 * HONEST LIMIT: a 4-digit PIN has only 10,000 possibilities, so hashing keeps it from being read out of
 * the database but cannot stop someone who copies the database and tries them all. The PIN is a child
 * lock for Parent Mode, not a vault; the screen adds a short lockout against guessing by tapping.
 */
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

/** SHA-256 of a byte array, as bytes. */
function sha256Bytes(data: number[]): number[] {
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const bytes = data.slice();
  const bitLen = data.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 0xff);
  const w = new Array<number>(64);
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = ((bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3]) >>> 0;
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }
  const out: number[] = [];
  for (const v of h) out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
  return out;
}

const toBytes = (s: string) => Array.from(s, (c) => c.charCodeAt(0) & 0xff);
const toHex = (b: number[]) => b.map((x) => x.toString(16).padStart(2, '0')).join('');

/** SHA-256 of an ASCII string as hex. Exported for the test vector. */
export const sha256Hex = (s: string) => toHex(sha256Bytes(toBytes(s)));

const ROUNDS = 2000;
function derive(pin: string, salt: string): string {
  let d = sha256Bytes(toBytes(`${salt}:${pin}`));
  for (let i = 0; i < ROUNDS; i++) d = sha256Bytes(d.concat(toBytes(salt)));
  return toHex(d);
}

const HASH = /^h1:[0-9a-f]{16}:[0-9a-f]{64}$/;
const LEGACY = /^\d{4}$/;
/** The factory default of older builds. Never accepted as a chosen PIN, and never trusted as one. */
export const OLD_DEFAULT_PIN = '1234';

/** Has the family chosen a PIN? ('' and the old factory default mean no.) */
export function hasPin(stored: string | null | undefined): boolean {
  if (!stored) return false;
  if (HASH.test(stored)) return true;
  return LEGACY.test(stored) && stored !== OLD_DEFAULT_PIN;
}

/** A PIN a child could guess in a few tries: the old default or one repeated digit. */
export function isWeakPin(pin: string): boolean {
  return pin === OLD_DEFAULT_PIN || /^(\d)\1{3}$/.test(pin);
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** The value to store for a new PIN. `random` is injectable so the check is deterministic. */
export function makePinRecord(pin: string, random: () => number = Math.random): string {
  let salt = '';
  for (let i = 0; i < 16; i++) salt += Math.floor(random() * 16).toString(16);
  return `h1:${salt}:${derive(pin, salt)}`;
}

/** Does `pin` match what is stored? Always false when no PIN has been chosen. */
export function verifyPin(pin: string, stored: string | null | undefined): boolean {
  if (!hasPin(stored) || !isValidPinFormat(pin)) return false;
  const s = stored as string;
  if (HASH.test(s)) {
    const [, salt, want] = s.split(':');
    const got = derive(pin, salt);
    // Compared in full without stopping at the first difference.
    let diff = 0;
    for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
    return diff === 0;
  }
  return pin === s; // legacy plain text
}

/** A stored value that should be rewritten as a hash after a successful entry. */
export const needsUpgrade = (stored: string): boolean => LEGACY.test(stored) && stored !== OLD_DEFAULT_PIN;

/** Wrong entries allowed before a short pause, and how long the pause is. */
export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 30_000;
