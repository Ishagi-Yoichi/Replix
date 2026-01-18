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
import { Metrics } from "./metrics.js";
import { startHttpServer } from "./server.js";



const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  const db = new DatabaseConnection();
  await db.connect();

  const metrics = new Metrics();

  // start HTTP server early, dlq is passed later
  startHttpServer(metrics);

  console.log("[HTTP] Server started");

  // ensure replication slot exists
  await ensureReplicationSlot(
    db.getClient(),
    config.replication.slotName,
    config.replication.plugin
  );

  // initialize Redis (non-blocking)
  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times) => Math.min(times * 100, 2000),
  });

  redis.on("connect", () => {
    console.log("[Redis] Connected");
    metrics.setStatus("UP");
  });

  redis.on("error", (err) => {
    console.error("[Redis Error]", err.message);
    metrics.setStatus("DOWN");
  });

  const dlq = new DeadLetterQueue(redis);
  const checkpointStore = new RedisCheckpointStore(redis);

  // now PATCH dlq size getter into server
  // by overriding startHttpServer with dlq presence
  startHttpServer(metrics, async () => {
    return await dlq.size();
  });

  // tick events/sec every second
  setInterval(() => metrics.tickRate(), 1000);

  // poll slot lag every 5s
  setInterval(async () => {
    try {
      const lag = await getSlotLag(db.getClient(), config.replication.slotName);
      if (lag) metrics.updateSlotLag(lag.lagBytes);
    } catch {
      metrics.setStatus("DOWN");
    }
  }, 5000);

  const lastLsn = await checkpointStore.get();
  console.log("[CDC] Starting from LSN:", lastLsn ?? "BEGINNING");

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
    dlq,
    metrics
  );

  // CDC LOOP
  while (true) {
    const start = Date.now();

    try {
      const processed = await processor.processBatch(config.cdc.batchSize);
      if (processed === 0) {
        await sleep(config.cdc.pollInterval);
      }
    } catch (err) {
      console.error("[CDC Error]", err);
      await sleep(1000);
    }

    const duration = Date.now() - start;
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

