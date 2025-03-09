"use strict";
module.exports = (app, db, conn, rethinkdb) => {
    app.post("/", async (req, res) => {
        res.send("Hello World!");
    });
    return app;
}