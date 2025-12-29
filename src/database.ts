

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
    
    async close(): Promise<void> {
        if (this.client) {
            await this.client.end();
            this.client = null;
        }
    }
}