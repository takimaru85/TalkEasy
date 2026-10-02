import { readFileSync } from 'node:fs';
// Checks the Free / TalkEasy Plus entitlement rules. Run: npm run check:plus
import {
  accessToItem,
  accessToItemOwnAuthored,
  currentPlan,
  freeCount,
  isPlus,
  lockedCount,
  parseStatus,
  serializeStatus,
} from '../src/subscription/access';
import { ALWAYS_FREE, GATED_AREAS, PLUS_BENEFITS } from '../src/subscription/catalog';
import { PLUS_PRODUCTS, displayPrice, productFor } from '../src/subscription/products';
import { builtinLessonIndexes } from '../src/subscription/lessons';
import { FREE_STATUS, type GatedArea, type SubscriptionStatus } from '../src/subscription/types';

let problems = 0;
const ok = (cond: unknown, msg: string) => { if (!cond) { problems++; console.log('FAIL', msg); } };

const AREAS = Object.keys(GATED_AREAS) as GatedArea[];
const now = new Date('2026-10-01T12:00:00.000Z');

// ---- the default is Free, and nothing accidental grants Plus --------------------------------------
ok(currentPlan(null, now) === 'free', 'no record means Free');
ok(currentPlan(undefined, now) === 'free', 'a missing record means Free');
ok(currentPlan(FREE_STATUS, now) === 'free', 'the free record means Free');
ok(parseStatus('').plan === 'free', 'an empty setting means Free');
ok(parseStatus('not json').plan === 'free', 'unreadable JSON means Free');
ok(parseStatus('{"plan":"platinum"}').plan === 'free', 'an unknown plan means Free');
ok(parseStatus('{"plan":"plus"}').source === 'none', 'a record with no source is not attributed to a store');

// ---- an expiry actually expires ------------------------------------------------------------------
const plus = (expiresAt: string | null): SubscriptionStatus => ({
  plan: 'plus', source: 'apple', productId: 'talkeasy.plus.yearly', expiresAt, verifiedAt: null,
});
ok(isPlus(plus(null), now), 'no expiry stays Plus');
ok(isPlus(plus('2026-10-02T12:00:00.000Z'), now), 'an expiry in the future is Plus');
ok(!isPlus(plus('2026-09-30T12:00:00.000Z'), now), 'an expiry in the past is back to Free');
ok(isPlus(plus('nonsense'), now), 'an unreadable expiry never silently removes access');

// ---- the free allowance ---------------------------------------------------------------------------
for (const area of AREAS) {
  const n = freeCount(area);
  ok(n >= 2, `${area}: the free allowance is at least 2 — a free plan with one item is a demo, not an app`);
  ok(accessToItem(area, 0, 'free').allowed, `${area}: the first item is free`);
  ok(accessToItem(area, n - 1, 'free').allowed, `${area}: the last free item is free`);
  ok(!accessToItem(area, n, 'free').allowed, `${area}: the next item asks for Plus`);
  ok(accessToItem(area, n, 'free').reason === 'plus', `${area}: and says why`);
  // Plus opens everything, including absurd indexes — no off-by-one can lock a paying family out.
  ok(accessToItem(area, 0, 'plus').allowed && accessToItem(area, 9999, 'plus').allowed, `${area}: Plus opens everything`);
  ok(lockedCount(area, n + 3, 'free') === 3, `${area}: counts what is locked`);
  ok(lockedCount(area, n + 3, 'plus') === 0, `${area}: nothing is locked on Plus`);
  ok(lockedCount(area, 1, 'free') === 0, `${area}: never reports a negative lock count`);
}

// The beginner ladder has to be free, or a child who is just starting meets a lock immediately.
ok(freeCount('speechPractice') >= 2, 'Speech Practice: sounds AND syllables are free');
ok(freeCount('listenTalk') >= 3, 'Listen & Talk: the whole developmental beginning is free');

// ---- a family's own content is never gated ---------------------------------------------------------
const far = 99;
ok(accessToItemOwnAuthored('lessons', far, 'free', true).allowed, "a parent's own lesson is always theirs");
ok(!accessToItemOwnAuthored('lessons', far, 'free', false).allowed, 'a built-in lesson beyond the allowance needs Plus');
ok(accessToItemOwnAuthored('lessons', far, 'plus', false).allowed, 'Plus opens the built-in lessons too');

// Built-in position ignores a family's own lessons entirely, so adding homework never locks a
// built-in lesson that used to be open.
const mixed = [
  { id: 10, isBuiltin: false },
  { id: 11, isBuiltin: true },
  { id: 12, isBuiltin: false },
  { id: 13, isBuiltin: true },
  { id: 14, isBuiltin: true },
];
const idx = builtinLessonIndexes(mixed);
ok(idx.get(11) === 0 && idx.get(13) === 1 && idx.get(14) === 2, 'built-in lessons are numbered among themselves');
ok(!idx.has(10) && !idx.has(12), "a grown-up's own lessons are not numbered at all");
ok(
  mixed.filter((l) => !l.isBuiltin).every((l) => accessToItemOwnAuthored('lessons', idx.get(l.id) ?? 0, 'free', true).allowed),
  'every parent-written lesson in a mixed list stays open',
);

// ---- pricing is never presented as more certain than it is -------------------------------------------
ok(PLUS_PRODUCTS.length === 2, 'two billing periods');
ok(PLUS_PRODUCTS.filter((p) => p.bestValue).length === 1, 'exactly one product is flagged best value');
ok(new Set(PLUS_PRODUCTS.map((p) => p.productId)).size === 2, 'product ids are distinct');
ok(PLUS_PRODUCTS.every((p) => p.productId.startsWith('talkeasy.plus.')), 'product ids share one namespace');
ok(productFor('yearly').period === 'yearly' && productFor('monthly').period === 'monthly', 'a period resolves to its product');
const monthly = productFor('monthly');
ok(displayPrice(monthly, {}).real === false, 'with no store price, the placeholder is marked as not real');
ok(displayPrice(monthly, { [monthly.productId]: '$2.99' }).text === '$2.99', "the store's own localised price wins");
ok(displayPrice(monthly, { [monthly.productId]: '$2.99' }).real === true, 'and is marked real');

// ---- the paywall may only promise what is true ---------------------------------------------------
ok(PLUS_BENEFITS.length >= 4 && ALWAYS_FREE.length >= 3, 'both lists are substantial');
// Nothing TalkEasy does not gate may be sold as a Plus benefit. Talk is the child's VOICE: if it
// ever appears in the benefits list, something has gone badly wrong.
const benefits = PLUS_BENEFITS.join(' ').toLowerCase();
for (const forbidden of ['talk tiles', 'communication tiles', 'feelings', 'my day', 'adventure world', 'parent mode']) {
  ok(!benefits.includes(forbidden), `Plus never claims to unlock "${forbidden}" — it is free and must stay free`);
}
const free = ALWAYS_FREE.join(' ').toLowerCase();
ok(free.includes('talk'), 'the always-free list names Talk explicitly');

// No pressure language anywhere a parent of a child with speech needs will read it.
const copy = [...PLUS_BENEFITS, ...ALWAYS_FREE].join(' ').toLowerCase();
for (const pushy of ['buy now', "don't miss", 'fall behind', 'hurry', 'limited time', 'act now', 'last chance']) {
  ok(!copy.includes(pushy), `no pressure language: "${pushy}"`);
}

// ---- a status survives a round trip ----------------------------------------------------------------
const record = plus('2027-01-01T00:00:00.000Z');
ok(parseStatus(serializeStatus(record)).expiresAt === record.expiresAt, 'a status round-trips through storage');
ok(parseStatus(serializeStatus(record)).source === 'apple', 'and keeps where it came from');

// ---- real billing: the rules that cost money when broken ------------------------------------------
{
  const store = readFileSync('src/subscription/storeProvider.ts', 'utf8');

  // GOOGLE REFUNDS ANY PURCHASE NOT ACKNOWLEDGED WITHIN THREE DAYS. Forgetting this does not fail
  // loudly — the family pays, gets Plus, and is silently refunded days later.
  ok(store.includes('finishTransactionAsync'), 'a completed purchase is acknowledged');
  ok(store.includes('finishTransactionAsync(purchase, false)'), 'acknowledged, NEVER consumed — a subscription is not a consumable');

  // Purchases arrive by listener (renewals, other devices, completions after a kill), so a listener
  // attached to a screen would miss them and a paying family would not be upgraded.
  ok(store.includes('setPurchaseListener'), 'purchases are handled by a listener');
  ok(store.includes('connectAsync'), 'the store connection is opened before use');

  // Only OUR products may ever grant Plus, and only in the PURCHASED state.
  ok(store.includes('OUR_PRODUCTS.has(purchase.productId)'), 'an unknown product never grants Plus');
  ok(store.includes('InAppPurchaseState.PURCHASED'), 'only a completed purchase grants Plus');

  // An offline app must not lock a paying family out when the store cannot be reached.
  ok(store.includes('return storedStatus();'), 'a store it cannot reach falls back to the cached entitlement');

  // The store SDK is optional, so Expo Go and the web preview still run.
  ok(store.includes('requireOptionalNativeModule'), 'the store SDK is optional');
  ok(!/^import .*expo-in-app-purchases/m.test(store), 'the store SDK is never imported at module scope');

  // Honesty about what has been proven.
  ok(/source: storeSource()|storeSource()/.test(store), 'an entitlement records which store sold it');
  ok(store.includes('verifiedAt'), 'an entitlement records when it was last confirmed');

  // The provider is chosen by capability, so a release cannot ship the mock and a dev is not locked
  // out of Expo Go.
  const index = readFileSync('src/subscription/index.ts', 'utf8');
  ok(index.includes('isStoreBillingAvailable() ? storeProvider : mockProvider'), 'the real provider is used whenever the build can sell');

  // The mock must never be able to take money or claim a store sold something.
  const mock = readFileSync('src/subscription/mockProvider.ts', 'utf8');
  ok(mock.includes('canPurchase: false'), 'the development provider still cannot sell');
  ok(!/'apple'|'google'/.test(mock), 'the development provider never claims a store entitlement');
}

console.log(`areas ${AREAS.length}, products ${PLUS_PRODUCTS.length}, problems ${problems}`);
if (problems) process.exit(1);
console.log('ALL OK');
