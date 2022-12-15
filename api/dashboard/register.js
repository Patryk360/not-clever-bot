"use strict";
module.exports = (app, db, conn) => {
    app.get("/", (req, res) => {
        const token = (Date.now() + Math.floor((Math.random() * 50) + 1)+Math.floor((Math.random() * 30) + 1))+(Date.now() - Math.floor((Math.random() * 100000) + 1)+Math.floor((Math.random() * 500) + 1)).toString(32);
        const data = {
            token: token,
            username: req.body.username??null,
            password: req.body.password??null,
            email: req.body.email??null,
            created: Date.now()
        }
        res.send(data);
    });
    return app;
}