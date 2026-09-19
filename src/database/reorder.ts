import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Moves row `id` one step up (-1) or down (+1) within an ordered list and re-numbers
 * `sort_order` 0..n-1 for the whole list. Used by every "Up / Down" button in parent mode.
 *
 * @param scopeSql  optional extra WHERE clause (e.g. 'category_id = ?') with its params
 */
export async function moveRow(
  db: SQLiteDatabase,
  table: string,
  id: number,
  direction: -1 | 1,
  scopeSql?: string,
  scopeParams: (number | string)[] = [],
): Promise<void> {
  const where = scopeSql ? `WHERE ${scopeSql}` : '';
  const rows = await db.getAllAsync<{ id: number }>(
    `SELECT id FROM ${table} ${where} ORDER BY sort_order, id`,
    ...scopeParams,
  );
  const ids = rows.map((r) => r.id);
  const index = ids.indexOf(id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= ids.length) return;

  [ids[index], ids[target]] = [ids[target], ids[index]];

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < ids.length; i++) {
      await db.runAsync(`UPDATE ${table} SET sort_order = ? WHERE id = ?`, i, ids[i]);
    }
  });
}
