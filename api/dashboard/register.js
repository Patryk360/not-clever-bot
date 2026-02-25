"use strict";
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

module.exports = (app, db, conn) => {
    app.get("/", (req, res) => {
        res.render("html/register.html", {});
    });

    app.post("/", async (req, res) => {
        console.log(req.body);

        try {
            await transporter.sendMail({
                from: `"NotCleverBot" <${process.env.MAIL_USER}>`,
                to: req.body.email,
                subject: "Zweryfikuj email",
                text: `Kliknij link aby zweryfikować email`,
                html: `
                    <h2>Weryfikacja email</h2>
                    <p>Kliknij link poniżej aby zweryfikować konto:</p>
                    `
            });

            console.log("Mail wysłany przez Gmail SMTP");
        } catch (error) {
            console.error("Błąd wysyłki maila:", error);
        }

        setTimeout(() => { res.send("done"); }, 2000);
    });
    return app;
}