"use strict";
const { solver } = require("../neurons/mainFunctions.js");

module.exports = (app, db, conn, rethinkdb) => {
    app.get("/", async (req, res) => {
        const userText = req.query.sentence;
        const userKey = req.query.key;

        if (userKey !== "TEST") return res.status(403).json({ error: "Nieprawidłowy klucz API." });
        
        if (!userText) {
            return res.status(400).json({ error: "Brak pytania." });
        }
        
        try {
            const botResponse = await solver(userText, db, conn, rethinkdb);
            
            await db.insert(rethinkdb, conn, "Data", {
                user_message: userText,
                bot_response: botResponse,
                timestamp: new Date()
            });

            res.json({ response: botResponse });
        } catch (error) {
            console.error("Błąd w response.js:", error);
            res.status(500).json({ error: "Błąd bota." });
        }
    });
    return app;
}