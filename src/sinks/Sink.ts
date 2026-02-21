import type { ParsedChange } from "../parser.js";

export interface Sink {
  write(change: ParsedChange): Promise<void>;
}
