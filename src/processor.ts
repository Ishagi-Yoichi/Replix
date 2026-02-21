import { ChangeReader } from "./reader.js";
import type { RawChangeEvent } from "./reader.js";
import { ChangeParser } from "./parser.js";
import type { Sink } from "./sinks/Sink.js";
import type { CheckpointStore } from "./checkpoint.js";
import { DeadLetterQueue } from "./dlq.js";
import { Metrics } from "./metrics.js";
import { broadcastEvent } from "./server.js";

export class ChangeProcessor {
  constructor(
    private reader: ChangeReader,
    private parser: ChangeParser,
    private checkpoint: CheckpointStore,
    private dlq: DeadLetterQueue,
    private metrics: Metrics,
    private sinks: Sink[],
  ) {}

  async processBatch(limit: number): Promise<number> {
    const rawEvents = await this.reader.readChanges(limit);
    let processed = 0;

    for (const event of rawEvents) {
      const parsed = this.parser.parse(event);

      if (!parsed) continue;

      try {
        // WRITE FIRST
        for (const sink of this.sinks) {
          try {
            await sink.write(parsed);
          } catch (err) {
            await this.dlq.push(parsed, "SINK_FAILED");
          }
        }

        // ACK ONLY AFTER SUCCESS
        await this.checkpoint.set(event.lsn);

        this.metrics.incrementEvents(event.lsn);
        //after succesfull processing, broadcast live eventss
        broadcastEvent({
          type: parsed.kind,
          table: parsed.table,
          lsn: parsed.lsn,
          ts: Date.now(),
        });
        console.log("[WS BROADCAST]", parsed.kind, parsed.table, parsed.lsn);
        processed++;
      } catch (err) {
        await this.dlq.push(event, "REDIS_WRITE_FAILED");
        console.error("Sent event to DLQ:", event.lsn);
        // stop batch on failure to preserve ordering
        break;
      }
    }

    return processed;
  }
}
