import type { RawChangeEvent } from "./reader.js";

export interface ParsedChange{
    lsn: string;
    xid: number;
    kind: 'insert' | 'update' | 'delete';
    schema:string;
    table:string;
    columnNames: string[];
    columnValues: any[];
    oldKeys?:{
        keyNames: string[];
        keyValues: any[];
    };
}

interface Wal2JsonChange {
    kind: 'insert' | 'update' | 'delete';
    schema: string;
    table: string;
    columnnames?: string[];
    columnvalues?: any[];
    oldkeys?: {
        keynames: string[];
        keyvalues: any[];
    };
}

interface Wal2JsonData {
    change: Wal2JsonChange[];
}

export class ChangeParser{
    parse(rawEvent:RawChangeEvent):ParsedChange | null{
        try{
            // Parsing JSON from rawEvent.data (wal2json format)
            const jsonData: Wal2JsonData = JSON.parse(rawEvent.data);
            
            // wal2json wraps changes in a 'change' array
            if (!jsonData.change || jsonData.change.length === 0) {
                return null;
            }
            
            const change = jsonData.change[0]; // Get first change
            if (!change) {
                return null;
            }
            
            const parsed: ParsedChange = {
                lsn: rawEvent.lsn,
                xid: rawEvent.xid,
                kind: change.kind,
                schema: change.schema,
                table: change.table,
                columnNames: change.columnnames || [],
                columnValues: change.columnvalues || [],
            };
            
            // Handle oldKeys for update/delete operations
            if (change.oldkeys && (change.kind === 'update' || change.kind === 'delete')) {
                parsed.oldKeys = {
                    keyNames: change.oldkeys.keynames || [],
                    keyValues: change.oldkeys.keyvalues || [],
                };
            }
            
            return parsed;
        }
        catch(err){
            console.error('Error parsing change:', err);
            return null;
        }
    }
}