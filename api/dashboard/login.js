"use strict";
module.exports = (app, db, conn) => {
    app.get("/", (req, res) => {
        res.render("html/login.html", {});
    });

    app.post("/", (req, res) => {
        console.log(req.body);
        res.send("ok");
    });
    return app;
}