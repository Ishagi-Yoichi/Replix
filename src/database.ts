
import { Client } from "pg";
import { config } from "./config.js";
export class DatabaseConnection{
    private client:Client | null =null;

    async connect(): Promise<void>{
        if (this.client) {
            throw new Error('Database is already connected');
        }
        
        this.client = new Client({
            host: String(config.postgres.host),
            port: Number(config.postgres.port),
            database: String(config.postgres.database),
            user: String(config.postgres.user),
            password: String(config.postgres.password),
        });
        
        await this.client.connect();
    }
    
    async testConnection(): Promise<boolean> {
        if (!this.client) {
            throw new Error('Database is not connected. Call connect() first.');
        }
        
        try {
            const result = await this.client.query('SELECT 1 as test');
            return result.rows[0]?.test === 1;
        } catch (error) {
            return false;
        }
    }
    
    getClient(): Client {
        if (!this.client) {
            throw new Error('Database is not connected. Call connect() first.');
        }
        return this.client;
    }
    
    async ensureReplicationSlot(slotName: string, plugin: string): Promise<void> {
        if (!this.client) {
            throw new Error('Database is not connected. Call connect() first.');
        }
        
        // Check if slot already exists
        const checkQuery = `
            SELECT COUNT(*) as count 
            FROM pg_replication_slots 
            WHERE slot_name = $1
        `;
        const checkResult = await this.client.query(checkQuery, [slotName]);
        
        if (checkResult.rows[0].count === '0') {
            console.log(`Creating replication slot "${slotName}" with plugin "${plugin}"...`);
            const createQuery = `SELECT pg_create_logical_replication_slot($1, $2)`;
            await this.client.query(createQuery, [slotName, plugin]);
            console.log(`Replication slot "${slotName}" created successfully.`);
        } else {
            console.log(`Replication slot "${slotName}" already exists.`);
        }
    }
    
    async close(): Promise<void> {
        if (this.client) {
            await this.client.end();
            this.client = null;
        }
    }
}