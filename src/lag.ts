import { Client } from "pg";

export interface SlotLag {
  slotName: string;
  lagBytes: number;
}

export async function getSlotLag(
  client: Client,
  slotName: string
): Promise<SlotLag | null> {
  const res = await client.query(
    `
    SELECT
      slot_name,
      pg_wal_lsn_diff(
        pg_current_wal_lsn(),
        confirmed_flush_lsn
      ) AS lag_bytes
    FROM pg_replication_slots
    WHERE slot_name = $1
    `,
    [slotName]
  );

  if (res.rowCount === 0) return null;

  return {
    slotName: res.rows[0].slot_name,
    lagBytes: Number(res.rows[0].lag_bytes),
  };
}
