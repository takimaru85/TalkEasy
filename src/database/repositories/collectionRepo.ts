import { getDb, nowIso } from '../db';
import { notify } from '../events';
import { getDiscoveries, markSeen, recordDiscoveries, type Discovery } from '../collectionStore';

export const collectionRepo = {
  async getDiscoveries(): Promise<Discovery[]> {
    return getDiscoveries(await getDb());
  },

  /** Records what the metrics say is earned. Idempotent; returns the ids that were new. */
  async record(ids: readonly string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const fresh = await recordDiscoveries(await getDb(), ids, nowIso());
    if (fresh.length) notify('collection');
    return fresh;
  },

  async markSeen(ids: readonly string[]): Promise<void> {
    if (ids.length === 0) return;
    await markSeen(await getDb(), ids);
    notify('collection');
  },
};
