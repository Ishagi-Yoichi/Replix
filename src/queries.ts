import { query } from "./db.js";

export async function createTable(){
    const sql = `
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
        );
    `;
    await query(sql,[]);
}

export async function insertUser(name:string, email:string){
    const sql = `
        INSERT INTO users (name,email)
        VALUES ($1 , $2)
        RETURNING *;
    `;
    const result = await query(sql, [name,email]);
    return result[0];
}

export async function getUsers() {
    const sql =`
        SELECT * FROM users;
    `;
    const result = await query(sql,[]);
    return result;
}