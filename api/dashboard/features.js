"use strict";
module.exports = (app, db, conn) => {
    app.get("/", (req, res) => {
        res.render("html/features.html", {});
    });
    return app;
}