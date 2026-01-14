import { Redis } from "ioredis";
import { config } from "./config.js";
import { DatabaseConnection } from "./database.js";
import { ChangeReader } from "./reader.js";
import { ChangeParser } from "./parser.js";
import { RedisWriter } from "./writer.js";
import { ChangeProcessor } from "./processor.js";
import { RedisCheckpointStore } from "./checkpoint.js";
import { ensureReplicationSlot } from "./slot.js";
import { getSlotLag } from "./lag.js";
import { DeadLetterQueue } from "./dlq.js";

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  const db = new DatabaseConnection();
  await db.connect();

  setInterval(async () => {
    try {
      const lag = await getSlotLag(
        db.getClient(),
        config.replication.slotName
      );
  
      if (lag) {
        console.log(
          `[SLOT LAG] ${lag.slotName}: ${lag.lagBytes} bytes`
        );
      }
    } catch (err) {
      console.error("Failed to fetch slot lag:", err);
    }
  }, 5000);

  // Ensure replication slot exists before starting
  await ensureReplicationSlot(
    db.getClient(),
    config.replication.slotName,
    config.replication.plugin
  );

  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  });

  const dlq = new DeadLetterQueue(redis);
  const checkpointStore = new RedisCheckpointStore(redis);
  const lastLsn = await checkpointStore.get();

  console.log("Starting CDC from LSN:", lastLsn ?? "BEGINNING");

  const reader = new ChangeReader(
    db.getClient(),
    config.replication.slotName
  );

  const parser = new ChangeParser();
  const writer = new RedisWriter(config.redis);

  const processor = new ChangeProcessor(
    reader,
    parser,
    writer,
    checkpointStore,
    dlq
  );

  while (true) {
    const start = Date.now();

    try {
      const processed = await processor.processBatch(
        config.cdc.batchSize
      );

      if (processed === 0) {
        await sleep(config.cdc.pollInterval);
      }
    } catch (err) {
      console.error("Fatal processing error:", err);
      await sleep(1000); // basic retry delay
    }

    const duration = Date.now() - start;

    // crude backpressure
    if (duration > config.cdc.pollInterval) {
      await sleep(duration);
    }
  }
}

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  process.exit(0);
});

main().catch(err => {
  console.error("Startup failed:", err);
  process.exit(1);
});
