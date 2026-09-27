import { DatabaseSync } from 'node:sqlite';
export type SQLiteDatabase = any;
export async function openDatabaseAsync(): Promise<any> {
  const raw = new DatabaseSync(':memory:');
  const shim: any = {
    execAsync: async (sql: string) => raw.exec(sql),
    runAsync: async (sql: string, ...p: any[]) => { const r = raw.prepare(sql).run(...p.flat()); return { lastInsertRowId: Number(r.lastInsertRowid), changes: r.changes }; },
    getFirstAsync: async (sql: string, ...p: any[]) => raw.prepare(sql).get(...p.flat()) ?? null,
    getAllAsync: async (sql: string, ...p: any[]) => raw.prepare(sql).all(...p.flat()),
    withTransactionAsync: async (t: () => Promise<void>) => { raw.exec('BEGIN'); try { await t(); raw.exec('COMMIT'); } catch (e) { raw.exec('ROLLBACK'); throw e; } },
    withExclusiveTransactionAsync: async (t: (x: any) => Promise<void>) => { raw.exec('BEGIN'); try { await t(shim); raw.exec('COMMIT'); } catch (e) { raw.exec('ROLLBACK'); throw e; } },
  };
  return shim;
}
