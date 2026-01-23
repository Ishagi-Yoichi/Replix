import {Redis} from "ioredis";

export class DeadLetterQueue {
  private readonly KEY = "replix:dlq";

  constructor(private redis: Redis) {}

  async push(event: unknown, reason: string) {
    await this.redis.lpush(
      this.KEY,
      JSON.stringify({
        reason,
        event,
        ts: new Date().toISOString(),
      })
    );
  }

  async size(): Promise<number> {
    return this.redis.llen(this.KEY);
  }

  async peek(start: number, end: number) {
    const items = await this.redis.lrange(this.KEY, start, end);
    return items.map(json => JSON.parse(json));
  }
  
  
}


