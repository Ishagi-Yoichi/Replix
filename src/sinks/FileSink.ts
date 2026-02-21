import fs from "fs/promises";
import type { ParsedChange } from "../parser.js";
import type { Sink } from "./Sink.js";
export class FileSink implements Sink {
  constructor(private filename: string) {}

  async write(change: ParsedChange): Promise<void> {
    await fs.appendFile(this.filename, JSON.stringify(change) + "\n");
  }
}
