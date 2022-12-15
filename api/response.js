"use strict";
const { solver } = require("../neurons/mainFunctions.js");
module.exports = (app, db, conn, rethinkdb) => {
    app.get("/", async (req, res) => {
        const data = await solver(req.query.sentence, rethinkdb);
        res.send(data);
    });
    return app;
}