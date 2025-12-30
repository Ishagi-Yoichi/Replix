import { RedisWriter } from '../src/writer.js';

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
  const writer = new RedisWriter({ host: 'localhost', port: 6379 });
  await writer.write(mockChange);
  console.log('Written to Redis!');
  await writer.close();
}

test().catch(console.error);