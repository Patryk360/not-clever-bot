"use strict";
const db = require("../database/databaseFunctions.js");
module.exports = (app, express, http, path, conn) => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(require("compression")());
    app.use(require("helmet")());
    const server = http.createServer(app);

    app.engine(".html", require("ejs").__express);
    app.set("views", path.join(__dirname, "../api"));
    app.set("view engine", "html");

    app.get("/", (req, res) => {
        res.render("html/main.html", {});
    });

    app.use("/api/response", require("../api/response.js")(express.Router(), db, conn));
    app.use("/api/send", require("../api/send.js")(express.Router(), db, conn));
    
    app.use("/images", express.static(path.join(__dirname, "../resources/images")));
    app.use("/bootstrap/css", express.static(path.join(__dirname, "../resources/bootstrap-5.2.2-dist/css")));
    app.use("/bootstrap/js", express.static(path.join(__dirname, "../resources/bootstrap-5.2.2-dist/js")));
    app.use("/jquery", express.static(path.join(__dirname, "../resources/jquery-3.6.0")));
    app.use("/css", express.static(path.join(__dirname, "../api/css")));
    app.use("/js", express.static(path.join(__dirname, "../api/js")));

    app.use((req, res) => {
        res.status(404).render("html/httpStatus/404.html", {
            err: {
                code: "Nie znaleziono strony '" + req.url + "' Strona nie istnieje lub tymczasowo nie działa :/"
            }
        });
    });

    app.use((error, req, res) => {
        res.status(500).render("html/httpStatus/500.html", {
            err: {
                url: req.url,
                code: error
            }
        });
    });

    const listener = server.listen(process.env.PORT || 8080, () => {
        console.log("Panel uruchomiony na porcie " + listener.address().port);
    });
}