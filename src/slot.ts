import { Client } from "pg";

export async function ensureReplicationSlot(
  client: Client,
  slotName: string,
  plugin: string
): Promise<void> {
  const res = await client.query(
    `SELECT slot_name FROM pg_replication_slots WHERE slot_name = $1`,
    [slotName]
  );

  if (res.rowCount && res.rowCount > 0) {
    console.log(`Replication slot '${slotName}' exists`);
    return;
  }

  console.log(`Creating replication slot '${slotName}'...`);

  await client.query(
    `SELECT pg_create_logical_replication_slot($1, $2)`,
    [slotName, plugin]
  );

  console.log(`Replication slot '${slotName}' created`);
}
