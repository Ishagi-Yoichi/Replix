import { DatabaseConnection } from '../src/database.js';
import { ChangeReader } from '../src/reader.js';

async function test() {
  const db = new DatabaseConnection();
  await db.connect();
  
  // creating reader
  const reader = new ChangeReader(db.getClient(), 'lag_test_slot');
  
  // reading changes
  const changes = await reader.readChanges(5);
  console.log('Found changes:', changes.length);
  console.log('First change:', changes[0]);
  
  await db.close();
}

test().catch(console.error);