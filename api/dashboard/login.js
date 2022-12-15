"use strict";
module.exports = (app, db, conn) => {
    app.get("/", (req, res) => {
        res.send("ok");
    });
    return app;
}