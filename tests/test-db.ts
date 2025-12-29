import { DatabaseConnection } from '../src/database.js';

async function test() {
  const db = new DatabaseConnection();
  try {
    await db.connect();
    console.log('Database connection established');
    
    const isConnected = await db.testConnection();
    console.log('Connection test:', isConnected ? 'PASSED' : 'FAILED');
    
    if (!isConnected) {
      throw new Error('Connection test failed');
    }
    
    await db.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error instanceof Error ? error.message : error);
    try {
      await db.close();
    } catch (closeError) {
    
    }
    process.exit(1);
  }
}

test();