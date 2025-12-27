import { Pool, type QueryResult } from "pg";

const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'Replix_exp',
    password:'mypassword',
    port:5432,
});

export async function query(sql:string,params:any[]){
    try{
        const result:QueryResult<any> = await pool.query(sql,params);
        return result.rows;
    }
    catch(err){
        console.log(err);
        throw err;
    }
}