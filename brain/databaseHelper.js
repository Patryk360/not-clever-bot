module.exports = {
    getSession: async (apiKey, db, conn, rethinkdb) => {
        let session = { emotion: 0, last_response: "", history: [], last_topic: "", memory: {}, personality: "neutralny", last_matched: "" };
        try {
            const cursor = await rethinkdb.table("Sessions").getAll(apiKey, {index: "apiKey"}).run(conn);
            const sessions = await cursor.toArray();
            if (sessions.length > 0) {
                session = sessions[0];
                if (!session.history) session.history = [];
                if (!session.memory) session.memory = {}; 
                if (!session.personality) session.personality = "neutralny";
                if (!session.last_matched) session.last_matched = "";
            } else {
                const insertRes = await db.insert(rethinkdb, conn, "Sessions", { 
                    apiKey, emotion: 0, last_response: "", history: [], last_topic: "", memory: {}, personality: "neutralny", last_matched: ""
                });
                session.id = insertRes.generated_keys[0];
            }
        } catch (e) { console.error("Błąd pobierania sesji:", e); }
        return session;
    },

    updateSession: async (session, originalText, finalResponse, conn, rethinkdb) => {
        session.history.push(originalText);
        if (session.history.length > 5) session.history.shift(); 
        try {
            await rethinkdb.table("Sessions").get(session.id).update({
                emotion: session.emotion, last_response: finalResponse, history: session.history,
                last_topic: session.last_topic || "", memory: session.memory,
                personality: session.personality, last_matched: session.last_matched
            }).run(conn);
        } catch (e) { console.error("Błąd aktualizacji sesji:", e); }
    }
}