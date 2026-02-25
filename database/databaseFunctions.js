"use strict";
module.exports = {
    get: async (rethinkdb, conn, tableName, id) => {
        try {
            return await rethinkdb.table(tableName).get(id).run(conn);
        } catch (err) {
            console.error(err);
            return null;
        }
    },
    update: async (rethinkdb, conn, tableName, id, data) => {
        try {
            return await rethinkdb.table(tableName).get(id).update(data).run(conn);
        } catch (err) {
            console.error(err);
            return null;
        }
    },
    insert: async (rethinkdb, conn, tableName, data) => {
        try {
            return await rethinkdb.table(tableName).insert(data).run(conn);
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}