import { RedisWriter } from '../src/writer.js';
import { config } from '../src/config.js';

const mockChange = {
  lsn: '0/16C1A28',
  xid: 745,
  kind: 'insert' as const,
  schema: 'public',
  table: 'users',
  columnNames: ['id', 'name', 'email'],
  columnValues: [1, 'Alice', 'alice@example.com']
};

async function test() {
  try {
    const writer = new RedisWriter({
      host: config.redis.host as string,
      port: config.redis.port as number,
      password: config.redis.password as string,
    });
    
    await writer.write(mockChange);
    console.log('Written to Redis!');
    await writer.close();
  } catch (error) {
    console.error('Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

test().catch(console.error);