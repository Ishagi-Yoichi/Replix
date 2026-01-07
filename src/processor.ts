import { ChangeReader } from "./reader.js";
import type { RawChangeEvent } from "./reader.js";
import { ChangeParser } from "./parser.js";
import { RedisWriter } from "./writer.js";
import type { CheckpointStore } from "./checkpoint.js";

export class ChangeProcessor {
  constructor(
    private reader: ChangeReader,
    private parser: ChangeParser,
    private writer: RedisWriter,
    private checkpoint: CheckpointStore
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
        console.error("Failed to process event:", {
          lsn: event.lsn,
          error: err,
        });

        // stop batch on failure to preserve ordering
        break;
      }
    }

    return processed;
  }
}
