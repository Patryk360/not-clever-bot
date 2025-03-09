"use strict";
require("dotenv").config();
module.exports = {
    connect: async (rethinkdb) => {
        const connection = await rethinkdb.connect({
            host: "130.61.95.106",
            port: 28015,
            db: "NotCleverBot",
            password: process.env.PASSWORD
        });
        return connection;
    }
}