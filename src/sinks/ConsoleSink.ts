import type { ParsedChange } from "../parser.js";
import type { Sink } from "./Sink.js";

export class ConsoleSink implements Sink {
  async write(change: ParsedChange): Promise<void> {
    console.log("[EVENT]", change.kind, change.table);
  }
}
