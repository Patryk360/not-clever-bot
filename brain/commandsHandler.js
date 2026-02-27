const { normalizeChatText } = require('./utils');

module.exports = {
    handleCommands: async (text, originalText, session, db, conn, rethinkdb) => {
        if (!text.startsWith("!")) return null;

        if (text === "!reset") {
            session.emotion = 0; session.history = []; session.last_topic = ""; session.memory = {};
            return "Formatowanie dysku... Zresetowałem swój układ logiczny. Kim jesteś?";
        } 
        if (text === "!stats") {
            const count = await rethinkdb.table("Knowledge").count().run(conn);
            return `Baza wiedzy: ${count} odpowiedzi. Mój nastrój: ${session.emotion}. Moja osobowość: ${session.personality}.`;
        }
        if (text.startsWith("!ucz ")) {
            const parts = originalText.substring(5).split("|");
            if (parts.length === 2) {
                const q = normalizeChatText(parts[0]);
                try {
                    await db.insert(rethinkdb, conn, "Knowledge", { question: q, answer: parts[1].trim(), learnedEmotion: session.emotion });
                    return `Zapisałem odpowiedź! Będę jej używał w nastroju ~${session.emotion}.`;
                } catch (e) { console.error("Błąd nauki:", e); return "Wystąpił błąd podczas nauki."; }
            } else return "Zły format! Użyj: !ucz <pytanie> | <odpowiedź>";
        }
        if (text.startsWith("!osobowość ")) {
            const nowa = text.split(" ")[1];
            if (["mruk", "optymista", "neutralny"].includes(nowa)) {
                session.personality = nowa;
                return `Moja osobowość to od teraz: ${nowa}.`;
            } else return "Dostępne osobowości: mruk, optymista, neutralny.";
        }
        if (text === "!źle") {
            if (session.last_matched) {
                try {
                    await rethinkdb.table("Knowledge").filter({ question: session.last_matched }).delete().run(conn);
                    const resp = `Przepraszam! Wyrzuciłem z pamięci wszystko, co wiedziałem o haśle: "${session.last_matched}". Naucz mnie tego ponownie!`;
                    session.last_matched = "";
                    return resp;
                } catch (e) { console.error("Błąd usuwania:", e); return "Błąd bazy danych."; }
            } else return "Nie pamiętam, co przed chwilą powiedziałem, żeby to usunąć!";
        }
        return "Komendy: !reset, !stats, !ucz, !osobowość <typ>, !źle.";
    }
}