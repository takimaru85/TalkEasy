// Sanity check for the data layer: runs the real migrations, seed and reorder helper against
// Node's built-in SQLite through a tiny shim of the expo-sqlite API. Run: npm run check:db
//
// Two scenarios are exercised:
//   1. fresh install   — all migrations then seed
//   2. v1 -> v2 upgrade — migration 1 + v1 seed shape, then migration 2 + seed v2 additions
import { DatabaseSync } from 'node:sqlite';
import { MIGRATIONS } from '../src/database/schema';
import { seedIfNeeded } from '../src/database/seed';
import { moveRow } from '../src/database/reorder';
import { DEFAULT_THERAPY, SEED_VERSION } from '../src/constants/defaults';
import { existsSync, readFileSync } from 'node:fs';
import { grantCashPurchase, purchaseItem, toggleEquip } from '../src/database/shopPurchase';
import { ALL_SHOP_ITEMS, SHOP_CATEGORIES, SHOP_ITEMS, getShopItem, methodsFor } from '../src/shop/catalog';
import { CASH_PURCHASES_ENABLED, PLUS_GATING_ENABLED } from '../src/subscription/release';
import { PREMIUM_THEMES, THEME_SLOT, activeThemeFrom } from '../src/shop/themes';
import { AVATAR_SLOT, DEFAULT_AVATAR, SPACE_AVATARS, activeAvatarFrom } from '../src/shop/avatars';
import { unavailableCashProvider } from '../src/shop/cashProvider';
import { earnLabel } from '../src/rewards/earnLabel';
import { claimReward, confirmClaim, declineClaim, withdrawClaim } from '../src/database/rewardClaim';
import { CLAIM_POLICY, claimKey, completionState, isMeaningfulTrace, pathLength, starsFor, type ClaimKind } from '../src/rewards/verification';
import { readdirSync as readDir, statSync as statOf } from 'node:fs';
import { COLLECTION, CATEGORIES, trophyId } from '../src/collection/registry';
import { NO_COLLECTION_METRICS, evaluateSpaceCollection } from '../src/collection/evaluate';
import { COLLECTION_ART_KEYS } from '../src/collection/artKeys';
import { getDiscoveries, markSeen, recordDiscoveries } from '../src/database/collectionStore';
import { ACTIVITY_PICTURES, ACTIVITY_PICTURE_RATIO, activityPictureKey } from '../src/activities/pictures';

function makeShim(raw: DatabaseSync): any {
  const shim: any = {
    execAsync: async (sql: string) => raw.exec(sql),
    runAsync: async (sql: string, ...params: any[]) => {
      const r = raw.prepare(sql).run(...params);
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: r.changes };
    },
    getFirstAsync: async (sql: string, ...params: any[]) => raw.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql: string, ...params: any[]) => raw.prepare(sql).all(...params),
    withTransactionAsync: async (task: () => Promise<void>) => { raw.exec('BEGIN'); try { await task(); raw.exec('COMMIT'); } catch (e) { raw.exec('ROLLBACK'); throw e; } },
    withExclusiveTransactionAsync: async (task: (txn: any) => Promise<void>) => { raw.exec('BEGIN'); try { await task(shim); raw.exec('COMMIT'); } catch (e) { raw.exec('ROLLBACK'); throw e; } },
  };
  return shim;
}

function migrate(raw: DatabaseSync, upTo: number) {
  const current = (raw.prepare('PRAGMA user_version').get() as any).user_version as number;
  for (const m of MIGRATIONS) {
    if (m.version <= current || m.version > upTo) continue;
    raw.exec(m.sql);
    raw.exec(`PRAGMA user_version = ${m.version}`);
  }
}

const count = (raw: DatabaseSync, t: string) => (raw.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as any).n as number;
const labels = (raw: DatabaseSync, sql: string) => (raw.prepare(sql).all() as any[]).map((r) => r.label ?? r.name).join(', ');

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error('ASSERT: ' + msg);
}

// Migration 6: Speech Practice. Same rule as Sound Practice - a practice log, never audio and
// never a score - plus the My Words flag on Talk cards, off for every existing card.
function checkSpeechPractice(raw: DatabaseSync) {
  const cols = (raw.prepare('PRAGMA table_info(speech_practice_events)').all() as any[]).map((c) => c.name);
  assert(cols.includes('activity_id') && cols.includes('kind') && cols.includes('duration_ms'), 'speech practice columns');
  assert(!cols.some((c: string) => /audio|uri|path|recording|score|correct|accuracy/.test(c)), 'speech practice stores no audio and no score');
  raw.prepare("INSERT INTO speech_practice_events (activity_id, kind, item, duration_ms, created_at) VALUES ('words','exercise','Dog',0,?)").run(new Date().toISOString());
  assert(count(raw, 'speech_practice_events') === 1, 'speech practice event recorded');
  const buttonCols = (raw.prepare('PRAGMA table_info(communication_buttons)').all() as any[]).map((c) => c.name);
  assert(buttonCols.includes('practice'), 'communication_buttons.practice added');
  assert((raw.prepare('SELECT COUNT(*) AS n FROM communication_buttons WHERE practice = 1').get() as any).n === 0, 'no card is a practice word by default');
}

// Migration 17: the Rewards Shop. ONE ledger: a purchase is a negative star event plus an owned row,
// in one transaction, so the balance cannot disagree with what is owned and nothing is spent twice.
async function checkShop() {
  console.log('--- rewards shop');
  const raw = new DatabaseSync(':memory:');
  migrate(raw, 99);
  const shim = makeShim(raw);
  const now = new Date().toISOString();
  const balance = () => ((raw.prepare('SELECT COALESCE(SUM(amount),0) AS t FROM star_events').get() as any).t as number);
  const owned = () => count(raw, 'shop_purchases');
  const byId = (id: string) => SHOP_ITEMS.find((i) => i.id === id)!;
  const item = { ...byId('sticker-paw'), cost: byId('sticker-paw').stars! };
  assert(new Set(SHOP_ITEMS.map((i) => i.id)).size === SHOP_ITEMS.length, 'shop item ids are unique');
  assert(SHOP_ITEMS.every((i) => i.stars === undefined || (Number.isInteger(i.stars) && i.stars > 0)), 'every star price is a positive whole number');
  assert(SHOP_ITEMS.every((i) => i.free || methodsFor(i).length > 0), 'every item is free or can be had some way');
  assert(SHOP_ITEMS.filter((i) => i.free).length === 1 && SHOP_ITEMS.find((i) => i.free)!.avatarId === DEFAULT_AVATAR, 'exactly one free item: the Astro Explorer starter');
  assert(new Set(ALL_SHOP_ITEMS.flatMap((i) => (i.cash ? [i.cash.productId] : []))).size === ALL_SHOP_ITEMS.filter((i) => i.cash).length, 'cash product ids are unique');
  assert(ALL_SHOP_ITEMS.some((i) => i.stars !== undefined && i.cash) && ALL_SHOP_ITEMS.some((i) => i.stars === undefined && i.cash) && ALL_SHOP_ITEMS.some((i) => i.stars !== undefined && !i.cash), 'all three configurations exist: stars only, cash only, both');
  // This release sells with stars only: billing is not connected, so no Premium category, no cash offer and no
  // price a family cannot pay. (Turning CASH_PURCHASES_ENABLED on brings all of it back, see subscription/release.ts.)
  assert(CASH_PURCHASES_ENABLED || (!SHOP_ITEMS.some((i) => i.category === 'premium') && !SHOP_CATEGORIES.some((c) => c.id === 'premium')), 'no Premium category or items while billing is off');
  assert(CASH_PURCHASES_ENABLED || SHOP_ITEMS.every((i) => !methodsFor(i).includes('cash')), 'no item offers a cash purchase while billing is off');
  assert(CASH_PURCHASES_ENABLED || getShopItem('premium-streak') === undefined, 'a hidden Premium item cannot be redeemed with stars either');
  assert(!PLUS_GATING_ENABLED, 'Plus gating is off in this release: nothing is locked');

  // Not enough stars: refused, and NOTHING moves.
  raw.prepare("INSERT INTO star_events (amount, reason, source, created_at) VALUES (?, 'test', 'learning', ?)").run(item.cost - 1, now);
  assert((await purchaseItem(shim, item.id, item.name, item.cost, now)) === 'insufficient', 'a short balance cannot buy');
  assert(balance() === item.cost - 1 && owned() === 0, 'a refused purchase deducts nothing and grants nothing');

  // Exactly enough: bought, deducted once, balance zero (not negative).
  raw.prepare("INSERT INTO star_events (amount, reason, source, created_at) VALUES (1, 'test', 'learning', ?)").run(now);
  assert((await purchaseItem(shim, item.id, item.name, item.cost, now)) === 'bought', 'an exact balance can buy');
  assert(balance() === 0 && owned() === 1, 'the price left the ledger and the item is owned');

  // Double tap / second attempt at the same item: owned, no second deduction, even with plenty of stars.
  raw.prepare("INSERT INTO star_events (amount, reason, source, created_at) VALUES (100, 'test', 'learning', ?)").run(now);
  assert((await purchaseItem(shim, item.id, item.name, item.cost, now)) === 'owned', 'the same item cannot be bought twice');
  assert(balance() === 100 && owned() === 1, 'a repeat purchase deducts nothing');

  // Lifetime earned is untouched by spending: levels and badges count from it.
  const lifetime = (raw.prepare('SELECT SUM(amount) AS t FROM star_events WHERE amount > 0').get() as any).t as number;
  assert(lifetime === item.cost + 100, 'spending does not reduce what was ever earned');

  // The ledger records WHY the stars left, so Parent Mode history reads sensibly.
  const spent = raw.prepare("SELECT reason, source FROM star_events WHERE amount < 0").get() as any;
  assert(spent.source === 'shop' && spent.reason.includes(item.name), 'a purchase is a labelled ledger entry');

  // A failure inside the transaction rolls the whole purchase back.
  const broken: any = { ...shim, runAsync: async (sql: string, ...p: any[]) => { if (sql.includes('shop_purchases')) throw new Error('disk full'); return shim.runAsync(sql, ...p); } };
  let threw = false;
  try { await purchaseItem(broken, byId('sticker-smile').id, byId('sticker-smile').name, byId('sticker-smile').stars!, now); } catch { threw = true; }
  assert(threw && balance() === 100 && owned() === 1, 'a failed purchase rolls back: the stars come back');

  // ---- cash: one inventory, never granted without the store's order id, never twice ----
  const cashItem = ALL_SHOP_ITEMS.find((i) => i.stars === undefined && i.cash)!;
  let refused = false;
  try { await grantCashPurchase(shim, cashItem.id, 'google', '', now); } catch { refused = true; }
  assert(refused && !(raw.prepare('SELECT 1 FROM shop_purchases WHERE item_id = ?').get(cashItem.id)), 'no order id, no grant');
  const before = balance();
  assert((await grantCashPurchase(shim, cashItem.id, 'google', 'GPA.1', now)) === 'granted', 'a confirmed purchase is granted');
  assert(balance() === before, 'a cash purchase moves no stars');
  assert((await grantCashPurchase(shim, cashItem.id, 'google', 'GPA.1', now)) === 'owned', 'the same order replayed grants nothing');
  assert((await grantCashPurchase(shim, cashItem.id, 'apple', 'APL.2', now)) === 'owned', 'a second order for an owned item grants nothing');
  assert(owned() === 2, 'cash and star purchases share ONE inventory');
  const both = ALL_SHOP_ITEMS.find((i) => i.stars !== undefined && i.cash)!;
  await grantCashPurchase(shim, both.id, 'google', 'GPA.3', now);
  assert((await purchaseItem(shim, both.id, both.name, both.stars!, now)) === 'owned' && balance() === before, 'an item bought with cash cannot then be redeemed with stars (and no stars leave)');
  assert((await unavailableCashProvider.purchase('x')).kind === 'unavailable' && !unavailableCashProvider.canPurchase, 'the build without billing sells nothing');

  // ---- equipping: only what is owned, one per slot, a second tap takes it off ----
  assert((await toggleEquip(shim, byId('sticker-paint').id)) === 'notOwned', 'an unowned item cannot be equipped');
  assert((await toggleEquip(shim, item.id)) === 'equipped', 'an owned item equips');
  assert((await toggleEquip(shim, cashItem.id)) === 'equipped' && (raw.prepare("SELECT item_id FROM shop_equipped WHERE slot = 'badge'").get() as any).item_id === cashItem.id, 'equipping another replaces it in the slot');
  assert((await toggleEquip(shim, cashItem.id)) === 'unequipped' && count(raw, 'shop_equipped') === 0, 'equipping the worn item takes it off');

  // ---- themes: same inventory, own slot, never active unless owned, free default when none ----
  const theme = PREMIUM_THEMES[0];
  const themeItem = SHOP_ITEMS.find((i) => i.id === theme.itemId)!;
  assert(activeThemeFrom({}, []) === null, 'a new install has no premium theme: the free Space Explorer shows');
  assert((await toggleEquip(shim, theme.itemId, THEME_SLOT)) === 'notOwned', 'a locked theme cannot be activated');
  assert(activeThemeFrom({ [THEME_SLOT]: theme.itemId }, []) === null, 'an equipped but unowned theme is not active');
  raw.prepare("INSERT INTO star_events (amount, reason, source, created_at) VALUES (?, 'test', 'learning', ?)").run(themeItem.stars! - balance() + 5, now);
  const beforeTheme = balance();
  assert((await purchaseItem(shim, themeItem.id, themeItem.name, themeItem.stars!, now)) === 'bought' && balance() === beforeTheme - themeItem.stars!, 'a theme is redeemed with stars from the one balance');
  assert((await purchaseItem(shim, themeItem.id, themeItem.name, themeItem.stars!, now)) === 'owned' && balance() === beforeTheme - themeItem.stars!, 'an owned theme is never charged again');
  assert((await toggleEquip(shim, theme.itemId, THEME_SLOT)) === 'equipped', 'an owned theme activates');
  const eq = Object.fromEntries((raw.prepare('SELECT slot, item_id FROM shop_equipped').all() as any[]).map((r) => [r.slot, r.item_id]));
  assert(activeThemeFrom(eq, [theme.itemId]) === theme.id, 'the active theme is read back from storage (survives a restart)');
  await toggleEquip(shim, item.id); // a badge in the other slot
  assert((raw.prepare("SELECT item_id FROM shop_equipped WHERE slot = ?").get(THEME_SLOT) as any).item_id === theme.itemId, 'wearing a badge does not change the theme');
  assert((await toggleEquip(shim, theme.itemId, THEME_SLOT)) === 'unequipped' && !raw.prepare('SELECT 1 FROM shop_equipped WHERE slot = ?').get(THEME_SLOT), 'a theme can be switched off and the free world returns');
  assert((await toggleEquip(shim, theme.itemId, THEME_SLOT)) === 'equipped' && balance() === beforeTheme - themeItem.stars!, 'reactivating an owned theme costs nothing');

  // ---- avatars: free starter by default, own slot, never worn unless owned ----
  assert(activeAvatarFrom({}, []) === DEFAULT_AVATAR && DEFAULT_AVATAR === 'astro-explorer', 'a new install wears the free Astro Explorer');
  assert(SPACE_AVATARS.length === 5 && SPACE_AVATARS.filter((a) => a.free).length === 1, 'five avatars, one of them free');
  const paid = SPACE_AVATARS.find((a) => a.itemId)!;
  assert((await toggleEquip(shim, paid.itemId!, AVATAR_SLOT)) === 'notOwned', 'a locked avatar cannot be worn');
  assert(activeAvatarFrom({ [AVATAR_SLOT]: paid.itemId! }, []) === DEFAULT_AVATAR, 'an equipped but unowned avatar falls back to the starter');
  raw.prepare("INSERT INTO star_events (amount, reason, source, created_at) VALUES (?, 'test', 'learning', ?)").run(paid.stars! + 5, now);
  const beforeAv = balance();
  assert((await purchaseItem(shim, paid.itemId!, paid.name, paid.stars!, now)) === 'bought' && balance() === beforeAv - paid.stars!, 'an avatar is redeemed with stars from the one balance');
  assert((await purchaseItem(shim, paid.itemId!, paid.name, paid.stars!, now)) === 'owned' && balance() === beforeAv - paid.stars!, 'an owned avatar is never charged again');
  assert((await toggleEquip(shim, paid.itemId!, AVATAR_SLOT)) === 'equipped', 'an owned avatar can be worn');
  const eq2 = Object.fromEntries((raw.prepare('SELECT slot, item_id FROM shop_equipped').all() as any[]).map((r) => [r.slot, r.item_id]));
  const owned2 = (raw.prepare('SELECT item_id FROM shop_purchases').all() as any[]).map((r) => r.item_id);
  assert(activeAvatarFrom(eq2, owned2) === paid.id, 'the worn avatar is read back from storage (survives a restart)');
  await toggleEquip(shim, paid.itemId!, AVATAR_SLOT);
  assert(activeAvatarFrom(Object.fromEntries((raw.prepare('SELECT slot, item_id FROM shop_equipped').all() as any[]).map((r) => [r.slot, r.item_id])), owned2) === DEFAULT_AVATAR, 'taking an avatar off returns to the starter');
  assert((await toggleEquip(shim, paid.itemId!, AVATAR_SLOT)) === 'equipped' && balance() === beforeAv - paid.stars!, 'switching back to an owned avatar costs nothing');

  // Two taps in flight at once (a fast double tap): the transactions run one after the other, the second sees the
  // item already owned, and the price leaves the ledger exactly once.
  {
    const ownedIds = new Set((raw.prepare('SELECT item_id FROM shop_purchases').all() as { item_id: string }[]).map((r) => r.item_id));
    const twin = SHOP_ITEMS.find((i) => i.stars !== undefined && i.stars > 0 && !i.free && !ownedIds.has(i.id))!;
    raw.prepare("INSERT INTO star_events (amount, reason, source, created_at) VALUES (?, 'test', 'learning', ?)").run(twin.stars!, now);
    const before = balance();
    let chain: Promise<unknown> = Promise.resolve();
    const serial: any = { ...shim, withTransactionAsync: (task: () => Promise<void>) => { const run = chain.then(() => shim.withTransactionAsync(task)); chain = run.catch(() => undefined); return run; } };
    const results = await Promise.all([purchaseItem(serial, twin.id, twin.name, twin.stars!, now), purchaseItem(serial, twin.id, twin.name, twin.stars!, now)]);
    assert(results.slice().sort().join() === 'bought,owned', 'two simultaneous taps: one buys, the other finds it owned (got ' + results.join() + ')');
    assert(balance() === before - twin.stars!, 'two simultaneous taps deduct the price exactly once');

  }

  assert(earnLabel(0) === '' && earnLabel(1) === 'Earn 1 star' && earnLabel(5) === 'Earn 5 stars' && earnLabel(1, 1) === 'Earn up to 2 stars', 'earn labels follow the configured amounts');
  console.log('shop ok');
}

// Migration 19: verified completion. One claim per completion, no matter how it is reached.
async function checkClaims() {
  console.log('--- verified rewards');
  const raw = new DatabaseSync(':memory:');
  migrate(raw, 99);
  const shim = makeShim(raw);
  const now = new Date().toISOString();
  const balance = () => ((raw.prepare('SELECT COALESCE(SUM(amount),0) AS t FROM star_events').get() as any).t as number);
  const input = (key: string, kind: ClaimKind, amount = 2) => ({ key, kind, source: CLAIM_POLICY[kind].source, reason: 'test', amount, requiresParent: CLAIM_POLICY[kind].requiresParent });

  // Repeated Done taps / reopened screens / a restart: the same key pays once.
  const first = await claimReward(shim, input('quiz:a:1', 'quiz'), now);
  assert(first.outcome === 'credited' && balance() === 2, 'the first claim credits');
  for (let i = 0; i < 5; i++) assert((await claimReward(shim, input('quiz:a:1', 'quiz'), now)).outcome === 'duplicate', 'a repeated claim is a no-op');
  assert(balance() === 2, 'repeated claims for one completion credit exactly once');
  assert((await claimReward(shim, input('quiz:a:2', 'quiz'), now)).outcome === 'credited' && balance() === 4, 'a replay is a NEW completion and earns again');

  // The ledger is guarded independently of the claim row.
  let dup = false;
  try { raw.prepare("INSERT INTO star_events (amount, reason, source, created_at, claim_key) VALUES (1, 'x', 'learning', ?, 'quiz:a:1')").run(now); } catch { dup = true; }
  assert(dup && balance() === 4, 'the ledger itself refuses a second row for the same claim key');

  // Offline: nothing is credited until a grown-up confirms, and confirming twice credits once.
  const off = await claimReward(shim, input('offline:7:2026-10-04', 'offline', 3), now);
  assert(off.outcome === 'awaiting_parent' && balance() === 4, 'an offline task waits and credits nothing');
  assert((await claimReward(shim, input('offline:7:2026-10-04', 'offline', 3), now)).outcome === 'duplicate' && balance() === 4, 'tapping Done again while waiting changes nothing');
  assert((await confirmClaim(shim, 'offline:7:2026-10-04', 'activity', now)) === 'credited' && balance() === 7, 'a grown-up confirming credits it');
  assert((await confirmClaim(shim, 'offline:7:2026-10-04', 'activity', now)) === 'already' && balance() === 7, 'confirming again credits nothing more');
  assert((await confirmClaim(shim, 'nope', 'activity', now)) === 'missing', 'confirming a claim that does not exist does nothing');
  assert((await claimReward(shim, input('offline:7:2026-10-04', 'offline', 3), now)).outcome === 'duplicate' && balance() === 7, 'a credited task cannot be claimed again');

  // Declined is not a verdict: doing it again asks again, and still pays once.
  await claimReward(shim, input('assignment:9', 'assignment', 2), now);
  assert((await declineClaim(shim, 'assignment:9', now)) === 'declined' && balance() === 7, 'declining credits nothing');
  assert((await confirmClaim(shim, 'assignment:9', 'assignment', now)) === 'declined' && balance() === 7, 'a declined claim cannot be confirmed');
  assert((await claimReward(shim, input('assignment:9', 'assignment', 2), now)).outcome === 'awaiting_parent', 'doing it again after "not this time" asks again');
  assert((await confirmClaim(shim, 'assignment:9', 'assignment', now)) === 'credited' && balance() === 9, 'and then credits once');

  // Un-ticking a task that is still waiting takes it off the list; a credited one is never taken back.
  await claimReward(shim, input('offline:8:2026-10-04', 'offline', 3), now);
  assert((await withdrawClaim(shim, 'offline:8:2026-10-04')) === true && balance() === 9, 'withdrawing a waiting claim removes it');
  assert((await withdrawClaim(shim, 'quiz:a:1')) === false && balance() === 9, 'a credited claim cannot be withdrawn');

  // A kind switched off still records the completion, and pays nothing.
  assert((await claimReward(shim, input('quiz:b:1', 'quiz', 0), now)).outcome === 'credited' && balance() === 9, 'a zero-star kind credits nothing');
  let noKey = false;
  try { await claimReward(shim, input('', 'quiz'), now); } catch { noKey = true; }
  assert(noKey, 'a claim without a key is refused');
  const audit = raw.prepare("SELECT COUNT(*) AS n FROM reward_claims WHERE status = 'credited'").get() as any;
  assert(audit.n >= 4, 'every claim leaves an audit row');

  // The rules themselves.
  const rates = { starsPerLearningSession: 1, starsPerPerfectSession: 2, starsPerRoutineStep: 3, starsPerActivity: 4, starsPerAssignment: 5 };
  assert(starsFor('quiz', rates) === 1 && starsFor('lesson', rates) === 1 && starsFor('perfect', rates) === 2 && starsFor('routine', rates) === 3 && starsFor('offline', rates) === 4 && starsFor('practice', rates) === 4 && starsFor('assignment', rates) === 5, 'each kind pays the grown-up\'s own rate');
  assert(starsFor('quiz', { ...rates, starsPerLearningSession: -3 }) === 0 && starsFor('quiz', { ...rates, starsPerLearningSession: NaN }) === 0, 'a bad rate pays nothing rather than a negative');
  assert(CLAIM_POLICY.offline.requiresParent && CLAIM_POLICY.assignment.requiresParent, 'tasks the app cannot see need a grown-up');
  assert(!CLAIM_POLICY.quiz.requiresParent && !CLAIM_POLICY.lesson.requiresParent && !CLAIM_POLICY.practice.requiresParent, 'tasks the app can see do not');
  assert(claimKey.quiz('x', 5) !== claimKey.quiz('x', 6) && claimKey.routine(1, '2026-10-04') !== claimKey.routine(1, '2026-10-05') && claimKey.assignment(3) === claimKey.assignment(3), 'claim keys identify a completion');
  assert(completionState(undefined, false) === 'not_started' && completionState(undefined, true) === 'in_progress' && completionState('awaiting_parent', false) === 'awaiting_parent' && completionState('credited', false) === 'reward_credited' && completionState('declined', false) === 'not_started', 'completion states');

  // Tracing: an empty canvas or a tap is not a try; a wobbly line is.
  assert(!isMeaningfulTrace([]) && !isMeaningfulTrace([0, 3]) && isMeaningfulTrace([3, 40]), 'only a real stroke counts as a trace');
  assert(Math.round(pathLength('M 0 0 L 30 40')) === 50 && pathLength('') === 0 && pathLength('M 5 5') === 0, 'stroke length');

  // No screen can mint stars or pick an amount: the only door is the claim hook.
  const walk = (dir: string): string[] => readDir(dir).flatMap((f) => { const full = dir + '/' + f; return statOf(full).isDirectory() ? walk(full) : /\.tsx?$/.test(f) ? [full] : []; });
  const offenders = walk('src/screens/child').concat(walk('src/components')).filter((f) => /rewardsRepo\.(addStars|claim)\(|useAwardStars/.test(readFileSync(f, 'utf8')));
  assert(offenders.length === 0, 'child screens and components never add stars or claim directly: ' + offenders.join(', '));
  // And no manual star control anywhere in Parent Mode: the balance moves only by verified activity, confirmation, or spending.
  const parentOffenders = walk('src/screens/parent').filter((f) => /rewardsRepo\.addStars\(/.test(readFileSync(f, 'utf8')));
  assert(parentOffenders.length === 0, 'Parent Mode has no way to add or remove stars by hand: ' + parentOffenders.join(', '));
  const hooksSrc = readFileSync('src/hooks/useRewards.ts', 'utf8');
  assert(/starsFor\(kind, rates\)/.test(hooksSrc) && !/useAwardStars/.test(hooksSrc), 'the amount comes from starsFor inside the claim hook');
  console.log('claims ok');
}

// Migration 20: the Space Collection. Found things are recorded once, with a date, and never taken back.
async function checkCollection() {
  console.log('--- space collection');
  const raw = new DatabaseSync(':memory:');
  migrate(raw, 99);
  const shim = makeShim(raw);
  const now = '2026-10-04T10:00:00.000Z';
  const ids = COLLECTION.map((c) => c.id);
  assert(COLLECTION.length >= 1000, 'at least 1000 collectibles (' + COLLECTION.length + ')');
  assert(new Set(ids).size === ids.length, 'collectible ids are unique');
  assert(CATEGORIES.every((c) => COLLECTION.some((i) => i.category === c.id)), 'every category has collectibles');
  assert(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].every((r) => COLLECTION.some((i) => i.rarity === r)), 'all six rarities are used');
  assert(COLLECTION.every((i) => i.fact.length > 10 && i.hint.length > 5), 'every collectible has a fun fact and a hint');
  assert(COLLECTION.every((i) => i.art.startsWith('avatar:') || i.art.startsWith('world:') || i.art.startsWith('emoji:') || (COLLECTION_ART_KEYS as readonly string[]).includes(i.art)), 'every collectible has a drawing');
  assert(COLLECTION.filter((i) => i.legacy).map((i) => i.id).sort().join() === 'earth,golden-star,moon,rocket,saturn', 'the five original collectibles are kept');

  // Nothing found at the start; thresholds are measured, not assumed.
  const none = evaluateSpaceCollection(NO_COLLECTION_METRICS, new Map());
  assert(none.found === 0 && none.earnedIds.length === 0, 'nothing is found with no practice');
  const legacy = evaluateSpaceCollection({ ...NO_COLLECTION_METRICS, speechPractice: 1, tracingSessions: 1, missionDays: 1, baRowSyllables: 0, talkTaps: 0 }, new Map());
  assert(['golden-star', 'moon', 'saturn'].every((id) => legacy.items.find((i) => i.id === id)!.found) && !legacy.items.find((i) => i.id === 'earth')!.found, 'the original milestones still find the original items');
  // Tapping Done / opening screens changes no metric, so it cannot find anything: only verified metrics do.
  const lessons = evaluateSpaceCollection({ ...NO_COLLECTION_METRICS, lessons: 1 }, new Map());
  assert(lessons.items.find((i) => i.id === 'venus')!.found && !lessons.items.find((i) => i.id === 'galaxy-cat')!.found, 'a verified lesson finds Venus but not the Galaxy Cat (needs 3)');
  assert(!evaluateSpaceCollection({ ...NO_COLLECTION_METRICS, offlineConfirmed: 0 }, new Map()).items.find((i) => i.id === 'treasure-chest')!.found && evaluateSpaceCollection({ ...NO_COLLECTION_METRICS, offlineConfirmed: 1 }, new Map()).items.find((i) => i.id === 'treasure-chest')!.found, 'the treasure chest needs a grown-up-confirmed activity');

  // Milestones build on real finds: 10 found => Alien Egg, 20 => Legendary Badge; a full category => the trophy.
  const rich = { ...NO_COLLECTION_METRICS, speechPractice: 9999, sounds: 999, words: 999, quizzes: 999, lessons: 999, tracingSessions: 999, practiceSessions: 999, routineSteps: 999, missionDays: 999, talkTaps: 9999, baRowSyllables: 5, stars: 9999, streak: 999, offlineConfirmed: 2 };
  const all = evaluateSpaceCollection(rich, new Map());
  assert(all.found === COLLECTION.length, 'enough verified practice finds everything (' + all.found + ')');
  assert(all.completeCategories.length === CATEGORIES.length && all.earnedIds.includes(trophyId('vehicles')), 'a finished category earns its trophy');
  const nine = evaluateSpaceCollection({ ...NO_COLLECTION_METRICS, sounds: 3, speechPractice: 1, quizzes: 1, tracingSessions: 1 }, new Map());
  assert(nine.found < 10 && !nine.items.find((i) => i.id === 'alien-egg')!.found, 'fewer than 10 found: no Alien Egg yet');

  // Found things are never taken back: recorded ids stay found even if the metrics fall to zero.
  const kept = evaluateSpaceCollection(NO_COLLECTION_METRICS, new Map([['mars', now], ['jupiter', now]]));
  assert(kept.found === 2 && kept.items.find((i) => i.id === 'mars')!.discoveredAt === now, 'a recorded discovery stays found and keeps its date');

  // Recording: idempotent, no duplicates, backfill first, real dates after.
  assert((await recordDiscoveries(shim, ['mars', 'jupiter'], now)).length === 2, 'the first sync records what was already earned');
  let rows = await getDiscoveries(shim);
  assert(rows.length === 2 && rows.every((r) => r.backfilled && r.seen), 'the first sync is a BACKFILL: dated "found earlier", already seen');
  assert((await recordDiscoveries(shim, ['mars', 'jupiter'], now)).length === 0, 'recording again adds nothing');
  assert((await recordDiscoveries(shim, ['venus', 'mars'], '2026-10-05T09:00:00.000Z')).join() === 'venus', 'only the new one is added');
  rows = await getDiscoveries(shim);
  const venus = rows.find((r) => r.id === 'venus')!;
  assert(rows.length === 3 && !venus.backfilled && !venus.seen && venus.discoveredAt === '2026-10-05T09:00:00.000Z', 'a later discovery has its real date and is unseen');
  await markSeen(shim, ['venus']);
  assert((await getDiscoveries(shim)).find((r) => r.id === 'venus')!.seen, 'a discovery can be marked seen');
  assert(!rows.some((r) => r.id === '__seeded__'), 'the seed marker is not a discovery');
  let dup = false;
  try { raw.prepare("INSERT INTO collectible_discoveries (item_id, discovered_at) VALUES ('mars', 'x')").run(); } catch { dup = true; }
  assert(dup, 'the same collectible cannot be recorded twice');
  console.log('collection ok');
}

async function freshInstall() {
  console.log('--- fresh install');
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 99);
  const shim = makeShim(raw);
  await seedIfNeeded(shim);
  await seedIfNeeded(shim); // no-op

  console.log('categories:', labels(raw, 'SELECT name FROM categories ORDER BY sort_order'));
  console.log('buttons', count(raw, 'communication_buttons'), '| favorites', count(raw, 'favorites'),
    '| routine items', count(raw, 'routine_items'), '| therapy', count(raw, 'therapy_activities'),
    '| subjects', count(raw, 'subjects'));
  console.log('school:', labels(raw, `SELECT b.label FROM communication_buttons b JOIN categories c ON c.id=b.category_id WHERE c.key='school' ORDER BY b.sort_order`));
  console.log('favorites:', labels(raw, `SELECT b.label FROM favorites f JOIN communication_buttons b ON b.id=f.button_id ORDER BY f.sort_order`));
  console.log('subjects:', labels(raw, 'SELECT name FROM subjects ORDER BY sort_order'));
  assert(count(raw, 'categories') === 11, 'eleven categories');
  // Migration 5: Sound Practice tracking. The table must exist and must hold no audio column -
  // the child's recording is temporary and is never persisted (see soundPracticeRepo).
  const soundCols = (raw.prepare('PRAGMA table_info(sound_practice_attempts)').all() as any[]).map((c) => c.name);
  assert(soundCols.length > 0, 'sound_practice_attempts created');
  assert(soundCols.includes('sound_id') && soundCols.includes('level') && soundCols.includes('duration_ms'), 'sound practice columns');
  assert(!soundCols.some((c: string) => /audio|uri|path|recording|score|correct/.test(c)), 'sound practice stores no audio and no score');
  raw.prepare("INSERT INTO sound_practice_attempts (sound_id, level, item, duration_ms, created_at) VALUES ('b','sound','B',1200,?)").run(new Date().toISOString());
  assert(count(raw, 'sound_practice_attempts') === 1, 'sound practice attempt recorded');
  checkSpeechPractice(raw);

  assert(count(raw, 'child_profile') === 1, 'demo profile seeded');
  assert((raw.prepare('SELECT name FROM child_profile').get() as any).name === 'Brayden', 'profile name');
  assert(count(raw, 'rewards') === 3, 'three rewards');
  assert(count(raw, 'lessons') === 3, 'three demo lessons');
  assert(count(raw, 'lesson_activities') === 10, 'ten demo activities');
  raw.prepare("INSERT INTO adaptive_attempts (child_id, lesson_id, activity_id, answer_method, correct, attempts, answer_text, completed_at) VALUES (1, 1, 1, 'speak', 1, 1, 'sunlight', 'x')").run();
  raw.prepare('DELETE FROM lessons WHERE id = 1').run();
  assert(count(raw, 'adaptive_attempts') === 0, 'attempts cascade with lesson');
  assert(count(raw, 'routine_items') === 12, 'twelve routine steps');
  assert((raw.prepare("SELECT segment FROM routine_items WHERE label='Bedtime'").get() as any).segment === 'evening', 'segment seeded');
  raw.prepare("INSERT INTO star_events (amount, reason, source, created_at) VALUES (3, 'test', 'manual', 'x')").run();
  assert((raw.prepare('SELECT SUM(amount) AS t FROM star_events').get() as any).t === 3, 'star ledger');
  assert(count(raw, 'subjects') === 6, 'six subjects');
  assert(count(raw, 'favorites') === 8, 'eight favorites');

  // Assignments + events + schedule smoke test
  const subj = (raw.prepare(`SELECT id FROM subjects WHERE name='Mathematics'`).get() as any).id;
  raw.prepare(`INSERT INTO assignments (subject_id,title,description,kind,date_assigned,due_date,priority,status,notes,created_at,updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(subj, 'Answer pages 25-26', '', 'assignment', '2026-09-18', '2026-09-21', 'medium', 'todo', '', 'x', 'x');
  raw.prepare(`INSERT INTO subject_schedule (subject_id, day_of_week, start_time, end_time) VALUES (?,?,?,?)`).run(subj, 1, '10:00', '11:00');
  raw.prepare(`INSERT INTO school_events (title,event_type,subject_id,date,time,notes,created_at) VALUES (?,?,?,?,?,?,?)`).run('Family day', 'event', null, '2026-09-25', null, '', 'x');
  raw.prepare(`INSERT INTO learning_progress (activity_key,subject_key,difficulty,correct,total,played_at) VALUES (?,?,?,?,?,?)`).run('math.counting', 'math', 'easy', 4, 5, 'x');
  const joined = raw.prepare(`SELECT a.title, s.name AS subject FROM assignments a LEFT JOIN subjects s ON s.id=a.subject_id`).get() as any;
  console.log('assignment join:', joined.title, '/', joined.subject);
  raw.prepare(`DELETE FROM subjects WHERE id = ?`).run(subj);
  const orphan = raw.prepare(`SELECT subject_id FROM assignments`).get() as any;
  assert(orphan.subject_id === null, 'assignment subject set to NULL after subject delete');
  assert(count(raw, 'subject_schedule') === 0, 'schedule cascades on subject delete');

  // therapy log
  const th = (raw.prepare(`SELECT id FROM therapy_activities LIMIT 1`).get() as any).id;
  raw.prepare(`INSERT INTO activity_logs (therapy_activity_id, completed_at, note) VALUES (?,?,?)`).run(th, 'x', '');
  raw.prepare(`DELETE FROM therapy_activities WHERE id=?`).run(th);
  assert(count(raw, 'activity_logs') === 0, 'activity logs cascade');

  const basic = (raw.prepare(`SELECT id FROM categories WHERE key='needs'`).get() as any).id;
  const help = (raw.prepare(`SELECT id FROM communication_buttons WHERE label='Help' AND category_id=?`).get(basic) as any).id;
  await moveRow(shim, 'communication_buttons', help, -1, 'category_id = ?', [basic]);
  // TalkEasy is English-only: a fresh install seeds no Filipino subject and no Filipino lesson.
  const seeded = raw.prepare('SELECT title, language FROM lessons ORDER BY id').all() as any[];
  assert(!seeded.some((l) => /^Mga hayop/.test(l.title)), 'the Filipino lesson is not seeded');
  assert(!(raw.prepare(`SELECT 1 FROM subjects WHERE LOWER(name) IN ('filipino', 'tagalog')`).get()), 'no Filipino subject is seeded');
  // The free allowance applies to built-in lessons only, so seeding must say which they are — the
  // same shape of bug as the language column, which the seed's own INSERT silently dropped.
  const builtin = raw.prepare('SELECT title, is_builtin FROM lessons').all() as any[];
  assert(builtin.length > 0 && builtin.every((l) => l.is_builtin === 1), 'every seeded lesson is marked built-in');
  assert(seeded.every((l) => l.language === ''), 'every seeded lesson uses the app voice (English)');
  // ---- the retired 'therapy' activity category (migration 16) ------------------------------------
  // Therapy is its own section now. A fresh install must not seed the six old therapy activities,
  // and no activity may be left in a category the Activities screen no longer shows — a row whose
  // category has no metadata would blow up when the screen looked up its label.
  const cats = (raw.prepare('SELECT DISTINCT category FROM therapy_activities').all() as any[]).map((r) => r.category);
  assert(!cats.includes('therapy'), "a fresh install seeds no 'therapy' activities");
  const KNOWN = ['games', 'art', 'music', 'exercise', 'reading', 'outdoor', 'sensory', 'chores'];
  assert(cats.every((c: string) => KNOWN.includes(c)), 'every seeded activity is in a category the screen can show');

  console.log('fresh OK');
}

async function upgradeFromV1() {
  console.log('--- v1 -> v2 upgrade');
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 1);
  // Reproduce the v1 seed shape: needs/people/choices/body/feelings/custom + the seeded_v1 flag.
  const cats = ['needs', 'people', 'choices', 'body', 'feelings', 'custom'];
  cats.forEach((k, i) => raw.prepare(`INSERT INTO categories (key,name,icon,color,sort_order,is_system,show_on_home) VALUES (?,?,?,?,?,1,?)`).run(k, k, 'star', '#fff', i, k === 'feelings' ? 0 : 1));
  const id = (k: string) => (raw.prepare(`SELECT id FROM categories WHERE key=?`).get(k) as any).id;
  const ins = (cat: string, label: string) => raw.prepare(`INSERT INTO communication_buttons (category_id,label,phrase,icon,color,sort_order,is_system,is_hidden,tap_count,created_at,updated_at) VALUES (?,?,?,?,?,0,1,0,3,'x','x')`).run(id(cat), label, label, 'star', '#fff');
  ins('needs', 'Water'); ins('choices', 'Yes'); ins('body', "I'm tired"); ins('people', 'Dad'); ins('custom', 'Blanket');
  raw.prepare(`INSERT INTO app_settings (key,value) VALUES ('seeded_v1','x'), ('parentPin','9999')`).run();
  raw.prepare(`INSERT INTO exercises (name,icon,instructions,duration_minutes,is_completed,sort_order,created_at) VALUES ('Arm stretch','arm-flex','',5,0,0,'x')`).run();
  raw.prepare(`INSERT INTO routines (name,is_active,created_at) VALUES ('My day',1,'x')`).run();
  raw.prepare(`INSERT INTO routine_items (routine_id,label,icon,sort_order,is_done) VALUES (1,'Wake up','x',0,0)`).run();
  // (start_time column exists only after migration 2; set it after migrating)

  migrate(raw, 2);
  raw.prepare("UPDATE routine_items SET start_time='06:30' WHERE label='Wake up'").run();
  migrate(raw, 99);
  await seedIfNeeded(makeShim(raw));

  console.log('categories:', labels(raw, 'SELECT name FROM categories ORDER BY sort_order'));
  assert(count(raw, 'categories') === 11, 'choices/body merged, new categories added');
  assert(count(raw, 'child_profile') === 1, 'profile created on upgrade');
  assert((raw.prepare("SELECT segment FROM routine_items WHERE label='Wake up'").get() as any).segment === 'morning', 'segment guessed on upgrade');
  const yes = raw.prepare(`SELECT c.key FROM communication_buttons b JOIN categories c ON c.id=b.category_id WHERE b.label='Yes'`).get() as any;
  assert(yes.key === 'needs', 'Yes moved into Basic');
  const water = raw.prepare(`SELECT tap_count FROM communication_buttons WHERE label='Water'`).get() as any;
  assert(water.tap_count === 3, 'existing Water row kept (tap_count preserved), not duplicated');
  assert(count(raw, 'communication_buttons') > 30, 'new defaults added');
  assert((raw.prepare(`SELECT value FROM app_settings WHERE key='parentPin'`).get() as any).value === '9999', 'PIN preserved');
  // The v1 row must survive the rename, and the default activities must arrive alongside it
  // without duplicating anything the parent already has.
  const survived = (raw.prepare("SELECT COUNT(*) AS n FROM therapy_activities WHERE name='Arm stretch'").get() as any).n;
  assert(survived === 1, 'the v1 exercise row survived the rename to therapy_activities');
  assert(count(raw, 'therapy_activities') === DEFAULT_THERAPY.length + 1, 'default activities added on upgrade, existing row kept');
  assert(count(raw, 'subjects') === 6, 'subjects seeded on upgrade');
  assert(count(raw, 'routines') === 1, 'routine not duplicated on upgrade');
  assert((raw.prepare(`SELECT value FROM app_settings WHERE key='seed_version'`).get() as any).value === String(SEED_VERSION), 'seed_version recorded');
  assert(count(raw, 'lessons') === 3, 'demo lessons added on upgrade');
  assert((raw.prepare('SELECT assistance_level FROM child_profile').get() as any).assistance_level === 'assisted', 'assistance level default');
  // Migration 5: Sound Practice tracking. The table must exist and must hold no audio column -
  // the child's recording is temporary and is never persisted (see soundPracticeRepo).
  const soundCols = (raw.prepare('PRAGMA table_info(sound_practice_attempts)').all() as any[]).map((c) => c.name);
  assert(soundCols.length > 0, 'sound_practice_attempts created');
  assert(soundCols.includes('sound_id') && soundCols.includes('level') && soundCols.includes('duration_ms'), 'sound practice columns');
  assert(!soundCols.some((c: string) => /audio|uri|path|recording|score|correct/.test(c)), 'sound practice stores no audio and no score');
  raw.prepare("INSERT INTO sound_practice_attempts (sound_id, level, item, duration_ms, created_at) VALUES ('b','sound','B',1200,?)").run(new Date().toISOString());
  assert(count(raw, 'sound_practice_attempts') === 1, 'sound practice attempt recorded');
  checkSpeechPractice(raw);
  console.log('upgrade OK');
}

// Migration 7: the Filipino family cards become English. A phone installed before it has "Ate" and
// "Kuya" cards; the untouched ones are renamed, a card the parent edited is left alone.
async function englishFamilyCards() {
  console.log('--- migration 7: Ate/Kuya -> Sister/Brother');
  const fresh = new DatabaseSync(':memory:');
  fresh.exec('PRAGMA foreign_keys = ON;');
  migrate(fresh, 99);
  await seedIfNeeded(makeShim(fresh));
  const freshLabels = labels(fresh, "SELECT b.label FROM communication_buttons b JOIN categories c ON c.id=b.category_id WHERE c.key='people'");
  assert(freshLabels.includes('Sister') && freshLabels.includes('Brother'), 'fresh install has Sister and Brother');
  assert(!/\bAte\b|\bKuya\b/.test(freshLabels), 'fresh install has no Ate / Kuya card');

  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 6);
  // seedIfNeeded is CURRENT code and in the real app only ever runs after EVERY migration. This
  // scenario deliberately rewinds the schema to v6 to give migration 7 something to do, so the
  // columns the current seed writes are added by hand; user_version stays at 6.
  raw.exec("ALTER TABLE lessons ADD COLUMN language TEXT NOT NULL DEFAULT ''");
  raw.exec('ALTER TABLE lessons ADD COLUMN is_builtin INTEGER NOT NULL DEFAULT 0');
  await seedIfNeeded(makeShim(raw));
  const people = (raw.prepare("SELECT id FROM categories WHERE key='people'").get() as any).id;
  // What an older install looked like: the seeded cards under their old names, and one edited by the parent.
  raw.prepare("UPDATE communication_buttons SET label='Ate', phrase='I want Ate.' WHERE label='Sister'").run();
  raw.prepare("UPDATE communication_buttons SET label='Kuya', phrase='Where is Kuya Jun?' WHERE label='Brother'").run();
  raw.prepare(`UPDATE child_profile SET favorites_json = '{"people":["Mom","Dad","Ate"]}'`).run();
  migrate(raw, 7);
  const row = (label: string) => raw.prepare('SELECT label, phrase FROM communication_buttons WHERE category_id = ? AND label = ?').get(people, label) as any;
  assert(row('Sister')?.phrase === 'I want my sister.', 'seeded Ate renamed to Sister');
  assert(row('Kuya')?.phrase === 'Where is Kuya Jun?', 'a card the parent edited is left alone');
  assert(!row('Ate'), 'no Ate card left');
  assert((raw.prepare('SELECT favorites_json FROM child_profile').get() as any).favorites_json.includes('"Sister"'), 'favourite person Ate -> Sister');
  console.log('migration 7 OK');
}


/**
 * Migration 16 retires the 'therapy' activity category.
 *
 * The six TalkEasy shipped are deleted; anything else in that category was created by a GROWN-UP and
 * is MOVED to 'exercise' instead. A cleanup that silently deleted a family's own work would be a bug
 * rather than a tidy-up, so that distinction is checked rather than trusted.
 */
async function retiredTherapyCategory() {
  console.log('--- migration 16: the retired therapy category');
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 15);

  const insert = (name: string, category: string) =>
    raw
      .prepare(
        `INSERT INTO therapy_activities (name, icon, instructions, duration_minutes, frequency, category, is_completed, sort_order, created_at)
         VALUES (?, 'star', 'x', 5, 'daily', ?, 0, 0, 'x')`,
      )
      .run(name, category);

  insert('Stretching', 'therapy');            // seeded — should go
  insert('Gentle yoga', 'therapy');           // seeded — should go
  insert("Dad's wobble board", 'therapy');    // a parent's own — must SURVIVE
  insert('Drawing time', 'art');              // untouched

  migrate(raw, 16);

  const rows = raw.prepare('SELECT name, category FROM therapy_activities ORDER BY name').all() as any[];
  const names = rows.map((r) => r.name);
  assert(!names.includes('Stretching'), 'the seeded Stretching activity is removed');
  assert(!names.includes('Gentle yoga'), 'the seeded Gentle yoga activity is removed');
  assert(names.includes("Dad's wobble board"), "a grown-up's own therapy activity is NOT deleted");
  assert(
    rows.find((r) => r.name === "Dad's wobble board")?.category === 'exercise',
    "a grown-up's own therapy activity moves to a category the screen still shows",
  );
  assert(rows.find((r) => r.name === 'Drawing time')?.category === 'art', 'other activities are untouched');
  assert(!rows.some((r) => r.category === 'therapy'), "no row is left in the retired category");
  console.log('migration 16 OK');
}

/**
 * The bundled pictures on the Activities detail screen.
 *
 * They are matched to the seeded activities BY NAME, which is a string a typo can break silently: a
 * picture keyed "ball paly" would simply never show and nothing would complain. So every key must
 * name a real seeded activity, every picture must exist at the shape the screen assumes, and the
 * registry the screen actually imports must list exactly the same files.
 */
function activityPictures() {
  console.log('--- activity pictures');
  const seeded = new Set(DEFAULT_THERAPY.map((a) => a.name.toLowerCase()));
  const keys = Object.keys(ACTIVITY_PICTURES);
  for (const name of keys) {
    assert(seeded.has(name), `"${name}" is a seeded activity, so its picture can be found`);
    const file = `assets/activities/${ACTIVITY_PICTURES[name]}.webp`;
    assert(existsSync(file), `${file} exists`);
    const buf = readFileSync(file);
    const kind = buf.toString('ascii', 12, 16);
    let w = 0;
    let h = 0;
    if (kind === 'VP8X') { w = 1 + buf.readUIntLE(24, 3); h = 1 + buf.readUIntLE(27, 3); }
    else if (kind === 'VP8 ') { w = buf.readUInt16LE(26) & 0x3fff; h = buf.readUInt16LE(28) & 0x3fff; }
    assert(w > 0 && Math.abs(w / h - ACTIVITY_PICTURE_RATIO) < 0.01, `${file} is the shape the screen assumes (${w}x${h})`);
  }
  assert(new Set(keys.map((k) => ACTIVITY_PICTURES[k])).size === keys.length, 'no two activities share a picture file');
  assert(activityPictureKey('  Ball Play ') === 'ball-play', 'lookup ignores case and surrounding spaces');
  assert(activityPictureKey('Look at photos') === undefined, 'an activity with no picture simply has none (it shows its icon)');
  // the registry the app really imports lists the same files
  const registry = readFileSync('src/components/activities/activityPictures.ts', 'utf8');
  for (const key of keys.map((k) => ACTIVITY_PICTURES[k])) {
    assert(registry.includes(`'${key}': require('../../../assets/activities/${key}.webp')`), `the registry requires ${key}`);
  }
  assert((registry.match(/: require\('\.\.\/\.\.\/\.\.\/assets\/activities\//g) ?? []).length === keys.length, 'the registry holds exactly the pictures the table names');
  // a grown-up's own photo must still win over a bundled picture
  const screen = readFileSync('src/screens/child/ActivitiesScreen.tsx', 'utf8');
  assert(screen.includes('open.imageUri ? null : activityPicture(open.name)'), "a photo a grown-up attached outranks the bundled picture");
  assert(!screen.includes('aspectRatio:'), 'the picture is sized with an explicit width and height (react-native-web ignores aspectRatio)');
  console.log('activity pictures OK');
}

// Migration 21: an install from before TalkEasy went English-only still has the built-in Filipino lesson and
// subject. They go; a lesson or subject a family made themselves stays.
async function removeFilipinoLeftovers() {
  console.log('--- migration 21: Filipino leftovers');
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  migrate(raw, 20);
  const now = '2026-01-01T00:00:00.000Z';
  const sub = (name: string) => Number(raw.prepare("INSERT INTO subjects (name, icon, color, created_at) VALUES (?, 'flag', '#000', ?)").run(name, now).lastInsertRowid);
  const lesson = (subject: number, title: string, builtin: number) => raw.prepare('INSERT INTO lessons (subject_id, title, is_builtin, created_at) VALUES (?, ?, ?, ?)').run(subject, title, builtin, now);
  const fil = sub('Filipino');
  lesson(fil, 'Mga hayop (Animals)', 1);
  const used = sub('Filipino');
  lesson(used, 'Mga hayop (Animals)', 1);
  lesson(used, 'My own Filipino notes', 0);
  const math = sub('Math');
  lesson(math, 'Adding to 10', 1);
  const mine = sub('Tagalog');
  lesson(mine, 'Mga hayop (Animals)', 0);
  migrate(raw, 99);
  assert(count(raw, "lessons WHERE title = 'Mga hayop (Animals)' AND is_builtin = 1") === 0, 'the built-in Filipino lesson is removed');
  assert(!raw.prepare('SELECT 1 FROM subjects WHERE id = ?').get(fil), 'an empty Filipino subject is removed');
  assert(!!raw.prepare('SELECT 1 FROM subjects WHERE id = ?').get(used), "a Filipino subject that still holds the family's own lesson stays");
  assert(count(raw, "lessons WHERE title = 'My own Filipino notes'") === 1, "the family's own lesson stays");
  assert(count(raw, "lessons WHERE title = 'Mga hayop (Animals)' AND is_builtin = 0") === 1, 'a lesson the family typed under that title stays');
  assert(!!raw.prepare('SELECT 1 FROM subjects WHERE id = ?').get(math) && count(raw, "lessons WHERE title = 'Adding to 10'") === 1, 'other built-in lessons are untouched');
  migrate(raw, 99);
  console.log('migration 21 OK');
}

(async () => {
  await freshInstall();
  await checkShop();
  await checkClaims();
  await checkCollection();
  await retiredTherapyCategory();
  await upgradeFromV1();
  await englishFamilyCards();
  await removeFilipinoLeftovers();
  activityPictures();
  console.log('ALL OK');
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
