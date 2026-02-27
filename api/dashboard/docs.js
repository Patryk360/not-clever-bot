"use strict";
module.exports = (app, db, conn) => {
    app.get("/", (req, res) => {
        res.render("html/docs.html", {});
    });
    return app;
}