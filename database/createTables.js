"use strict";
module.exports = {
    createTables: async (rethinkdb, conn) => {
        const tableList = await rethinkdb.tableList().run(conn);
        const tableArray = [
            { name: "Data", primaryKey: "id", index: false },
            { name: "Users", primaryKey: "name", index: [
                    { name: "apikey", multi: false },
                ]
            }
        ];
        if (tableList.length < tableArray.length) console.log("Creating a table in the database...");
        for (const table of tableArray) {
            const tableIS = tableList.find(a => a === table.name);
            if (!tableIS) {
                await rethinkdb.tableCreate(table.name, { primaryKey: table.primaryKey }).run(conn);
                console.log(`Table: ${table.name} is created!`);
            }
            if (table.index) {
                for (const index of table.index) {
                    const indexList = await rethinkdb.table(table.name).indexList().run(conn);
                    const indexIS = indexList.find(a => a === index.name);
                    if (!indexIS) {
                        if (index.multi) {
                            await rethinkdb.table(table.name).indexCreate(index.name, index.array).run(conn);
                            await rethinkdb.table(table.name).indexWait().run(conn);
                        } else if (!index.multi) {
                            await rethinkdb.table(table.name).indexCreate(index.name).run(conn);
                            await rethinkdb.table(table.name).indexWait().run(conn);
                        }
                    }
                }
            }
        }
        if (tableList.length < tableArray.length) console.log("The tables are created!");
    }
}