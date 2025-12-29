import { Client } from "pg";

export interface RawChangeEvent {
    lsn: string;
    xid: number;
    data: string;
}

export class ChangeReader{
    constructor(private client:Client,private slotName:string){}

    async readChanges(limit?: number): Promise<RawChangeEvent[]> {
         const query = `
         SELECT * FROM pg_logical_slot_get_changes($1, NULL, $2)
         `;
         const result = await this.client.query(query, [this.slotName, limit ?? null]);
         return result.rows;
    }
}