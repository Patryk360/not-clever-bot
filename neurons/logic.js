const { evaluate } = require('mathjs');
const axios = require('axios');

module.exports = {
    solverLogic: async (sentesence, resE, db, conn, rethinkdb) => {
        const text = sentesence.toLowerCase().trim();
        const originalText = sentesence.trim();

        const getEmotionText = (level) => {
            const lvl = parseInt(level);
            if (lvl > 2) return "bardzo radosna";
            if (lvl > 0) return "pozytywna";
            if (lvl < -2) return "bardzo smutna lub zdenerwowana";
            if (lvl < 0) return "nieco przygnębiona";
            return "neutralna";
        };

        const emotionDesc = getEmotionText(resE);

        const mathMatch = text.match(/\d+\s*[\+\-\*\/]\s*\d+/);
        if (mathMatch) {
            try {
                const expression = mathMatch[0];
                const result = evaluate(expression);
                if (result !== undefined) {
                    return `Wynik to: ${result}. (Moja emocja jest teraz ${emotionDesc})`;
                }
            } catch (error) {
                console.error("Błąd obliczeń:", error.message);
            }
        }

        try {
            const lastLogCursor = await rethinkdb.table("Data").orderBy(rethinkdb.desc("timestamp")).limit(1).run(conn);
            const lastLogArray = await lastLogCursor.toArray();

            if (lastLogArray.length > 0) {
                const lastInteraction = lastLogArray[0];
                if (lastInteraction.bot_response && lastInteraction.bot_response.includes("Nie wiem jak odpowiedzieć na:")) {
                    const match = lastInteraction.bot_response.match(/Nie wiem jak odpowiedzieć na: "(.*?)"/);
                    if (match && match[1]) {
                        const questionToLearn = match[1];
                        const newAnswer = originalText;
                        await db.insert(rethinkdb, conn, "Knowledge", { 
                            question: questionToLearn, 
                            answer: newAnswer 
                        });
                        return `Dzięki! Zapamiętałem, że na "${questionToLearn}" mam odpowiadać "${newAnswer}". (Czuję się teraz ${emotionDesc})`;
                    }
                }
            }
        } catch (err) {
            console.error("Błąd podczas auto-nauki:", err);
        }

        try {
            const cursor = await rethinkdb.table("Knowledge").filter({ question: text }).run(conn);
            const responses = await cursor.toArray();
            if (responses.length > 0) {
                const answer = responses[Math.floor(Math.random() * responses.length)].answer;
                return `${answer} (Moja emocja: ${emotionDesc})`;
            }
        } catch (e) {}

        try {
            const url = `https://pl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(originalText)}`;
            const response = await axios.get(url, {
                headers: { 'User-Agent': 'MojWlasnyBot/1.0 (Testowanie API)' }
            });
            if (response.data && response.data.extract) {
                return `Znalazłem w sieci: ${response.data.extract} (Moja emocja: ${emotionDesc})`;
            }
        } catch (error) {}

        return `Nie wiem jak odpowiedzieć na: "${text}". Co powinienem powiedzieć? (Aktualnie moja emocja jest ${emotionDesc})`;
    }
}