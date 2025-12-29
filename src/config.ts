import dotenv from "dotenv";

dotenv.config();

interface Config{
    postgres:{
        host:String,
        port:Number,
        database:String,
        user:String,
        password:String,
    };
    redis:{
        host:String,
        port:Number,
        password:String,
    };
    replication:{
        slotName: String,
        plugin: String,
    };
    cdc:{
        pollInterval:Number,
        batchSize:Number,
    }
}

export const config:Config = {
    postgres:{
        host:process.env.PG_HOST!,
        port:Number(process.env.PG_PORT!),
        database:process.env.PG_DATABASE!,
        user:process.env.PG_USER!,
        password:process.env.PG_PASSWORD!,
    },
    redis:{
        host:process.env.REDIS_HOST!,
        port:parseInt(process.env.REDIS_PORT!),
        password:process.env.REDIS_PASSWORD!,
    },
   replication:{
    slotName:process.env.REPLICATION_SLOT_NAME!,
    plugin:process.env.REPLICATION_PLUGIN!,
   },
   cdc:{
    pollInterval:parseInt(process.env.POLL_INTERVAL_MS!),
    batchSize:parseInt(process.env.BATCH_SIZE!),
   }
};

