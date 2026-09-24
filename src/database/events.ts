/**
 * Minimal pub/sub so screens refresh after a repository writes.
 * Repositories call `notify(topic)`; hooks call `subscribe(topic, cb)`.
 */
export type DbTopic =
  | 'categories'
  | 'buttons'
  | 'favorites'
  | 'routines'
  | 'exercises'
  | 'notes'
  | 'settings'
  | 'subjects'
  | 'assignments'
  | 'events'
  | 'learning'
  | 'profile'
  | 'rewards'
  | 'recent'
  | 'lessons'
  | 'adaptive'
  | 'soundPractice'
  | 'speechPractice';

type Listener = () => void;

const listeners = new Map<DbTopic, Set<Listener>>();

export function subscribe(topic: DbTopic, listener: Listener): () => void {
  let set = listeners.get(topic);
  if (!set) {
    set = new Set();
    listeners.set(topic, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
  };
}

export function notify(...topics: DbTopic[]): void {
  for (const topic of topics) {
    listeners.get(topic)?.forEach((l) => l());
  }
}
