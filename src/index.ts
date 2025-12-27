import { createTable,insertUser,getUsers } from "./queries.js";

async function main(){
    await createTable();
    const user:object = await insertUser('Sam','sam1@mail.com');
    console.log(user);
    const users = await getUsers();
    console.log(users);
}

main();