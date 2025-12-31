import Redis from "ioredis";
import type { ParsedChange } from "./parser.js";

export class RedisWriter{
    private redis:Redis.Redis;

    constructor(redisConfig:{host:string,port:number,password?:string}){
        this.redis = new Redis.Redis({
            ...redisConfig,
            retryStrategy: () => null,
            connectTimeout: 5000,
            lazyConnect: true,
        });
    }

    async write(change: ParsedChange): Promise<void>{
        const key = this.buildKey(change);
        
        if(change.kind === 'delete'){
            await this.redis.del(key);
        }else{
            const value = this.buildValue(change);
            await this.redis.set(key,value);
        }
    }

    private buildKey(change: ParsedChange): string {
        const idIndex = change.columnNames.indexOf('id');
        const id = idIndex !== -1 ? change.columnValues[idIndex] : 'unknown';
        return `${change.table}:${id}`;
    }


    private buildValue(change:ParsedChange):string{
        // Build JSON string from columnNames and columnValues
        const valueObject: Record<string, any> = {};
        
        // Zip columnNames and columnValues into an object
        for (let i = 0; i < change.columnNames.length; i++) {
            const columnName = change.columnNames[i];
            if (columnName && i < change.columnValues.length) {
                valueObject[columnName] = change.columnValues[i];
            }
        }
        
        return JSON.stringify(valueObject);
    }

    async close(): Promise<void> {
        await this.redis.quit();
      }
}