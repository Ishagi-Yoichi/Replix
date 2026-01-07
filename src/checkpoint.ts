import Redis from "ioredis";

export interface CheckpointStore {
  get(): Promise<string | null>;
  set(lsn: string): Promise<void>;
}

export class RedisCheckpointStore implements CheckpointStore {
  private readonly KEY = "replix:last_lsn";

  constructor(private redis: Redis.Redis) {}

  async get(): Promise<string | null> {
    return this.redis.get(this.KEY);
  }

  async set(lsn: string): Promise<void> {
    await this.redis.set(this.KEY, lsn);
  }
}
