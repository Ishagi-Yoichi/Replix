import { ChangeReader } from "./reader.js";
import type { RawChangeEvent } from "./reader.js";
import { ChangeParser } from "./parser.js";
import { RedisWriter } from "./writer.js";
import type { CheckpointStore } from "./checkpoint.js";
import { DeadLetterQueue } from "./dlq.js";

export class ChangeProcessor {
  constructor(
    private reader: ChangeReader,
    private parser: ChangeParser,
    private writer: RedisWriter,
    private checkpoint: CheckpointStore,
    private dlq:DeadLetterQueue
  ) {}

  async processBatch(limit: number): Promise<number> {
    const rawEvents = await this.reader.readChanges(limit);
    let processed = 0;

    for (const event of rawEvents) {
      const parsed = this.parser.parse(event);

      if (!parsed) continue;

      try {
        // WRITE FIRST
        await this.writer.write(parsed);

        // ACK ONLY AFTER SUCCESS
        await this.checkpoint.set(event.lsn);

        processed++;
      } catch (err) {
        await this.dlq.push(event,"REDIS_WRITE_FAILED");
        console.error("Sent event to DLQ:",event.lsn);
        // stop batch on failure to preserve ordering
        break;
      }
    }

    return processed;
  }
}
