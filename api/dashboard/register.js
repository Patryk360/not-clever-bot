"use strict";
module.exports = (app, db, conn) => {
    app.get("/", (req, res) => {
        res.render("html/register.html", {});
    });

    app.post("/", async (req, res) => {
        console.log(req.body);
        setTimeout(() => { res.send("done"); }, 2000);
    });
    return app;
}