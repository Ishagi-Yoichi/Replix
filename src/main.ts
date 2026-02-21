import Redis from "ioredis";

import { DatabaseConnection } from "./database.js";
import { ensureReplicationSlot } from "./slot.js";
import { getSlotLag } from "./lag.js";

import { ChangeReader } from "./reader.js";
import { ChangeParser } from "./parser.js";
import { ChangeProcessor } from "./processor.js";

import { RedisCheckpointStore } from "./checkpoint.js";
import { DeadLetterQueue } from "./dlq.js";
import { Metrics } from "./metrics.js";

import { startHttpServer } from "./server.js";

import { RedisSink } from "./sinks/RediSink.js";
import { FileSink } from "./sinks/FileSink.js";
import { ConsoleSink } from "./sinks/ConsoleSink.js";

import { config } from "./config.js";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const db = new DatabaseConnection();
  await db.connect();

  const metrics = new Metrics();

  // Redis
  const redis = new Redis.Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times) => Math.min(times * 100, 2000),
  });

  console.log(
    "[Redis Config]",
    config.redis.host,
    config.redis.port,
    config.redis.password ? "(password set)" : "(no password)",
  );

  await redis.set("replix:test", "ok");
  console.log("[Redis] Write test passed");

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

  //  HTTP + WS server
  startHttpServer(metrics, dlq);
  console.log("[HTTP] Server started");

  //  Replication slot safety
  await ensureReplicationSlot(
    db.getClient(),
    config.replication.slotName,
    config.replication.plugin,
  );

  //  Metrics ticking
  setInterval(() => metrics.tickRate(), 1000);

  //  Slot lag polling
  setInterval(async () => {
    try {
      const lag = await getSlotLag(db.getClient(), config.replication.slotName);

      if (lag) {
        metrics.updateSlotLag(lag.lagBytes);
      }
    } catch {
      metrics.setStatus("DOWN");
    }
  }, 5000);

  const lastLsn = await checkpointStore.get();

  console.log("[CDC] Starting from LSN:", lastLsn ?? "BEGINNING");

  const reader = new ChangeReader(db.getClient(), config.replication.slotName);

  const parser = new ChangeParser();

  //  MULTI-SINK SETUP
  const sinks = [
    new RedisSink(config.redis),
    new FileSink("cdc.log"),
    new ConsoleSink(),
  ];

  const processor = new ChangeProcessor(
    reader,
    parser,
    checkpointStore,
    dlq,
    metrics,
    sinks,
  );

  //  CDC LOOP
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

    //  Backpressure guard
    if (duration > config.cdc.pollInterval) {
      await sleep(duration);
    }
  }
}

//  Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[System] Shutting down...");
  process.exit(0);
});

main().catch((err) => {
  console.error("[Startup Failed]", err);
  process.exit(1);
});
