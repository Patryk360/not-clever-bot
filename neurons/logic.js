const { evaluate } = require('mathjs');
const axios = require('axios');
const stringSimilarity = require('string-similarity');

module.exports = {
    solverLogic: async (sentence, apiKey, textEmotionScore, db, conn, rethinkdb) => {
        const text = sentence.toLowerCase().trim();
        const originalText = sentence.trim();

        let session = { emotion: 0, last_response: "", history: [], last_topic: "" };
        try {
            const cursor = await rethinkdb.table("Sessions").getAll(apiKey, {index: "apiKey"}).run(conn);
            const sessions = await cursor.toArray();
            if (sessions.length > 0) {
                session = sessions[0];
                if (!session.history) session.history = [];
                if (!session.last_topic) session.last_topic = "";
            } else {
                const insertRes = await db.insert(rethinkdb, conn, "Sessions", { 
                    apiKey: apiKey, emotion: 0, last_response: "", history: [], last_topic: ""
                });
                session.id = insertRes.generated_keys[0];
            }
        } catch (e) { console.error("Błąd pobierania sesji:", e); }

        let rawAnswer = "";

        if (text.startsWith("!")) {
            if (text === "!reset") {
                session.emotion = 0;
                session.history = [];
                session.last_topic = "";
                rawAnswer = "Zresetowałem swój nastrój i zapomniałem o czym rozmawialiśmy. Zaczynamy od zera!";
            } 
            else if (text === "!stats") {
                const count = await rethinkdb.table("Knowledge").count().run(conn);
                rawAnswer = `W mojej bazie wiedzy znajduje się obecnie ${count} wyuczonych odpowiedzi. Mój nastrój wobec Ciebie to: ${session.emotion}.`;
            }
            else {
                rawAnswer = "Nieznana komenda systemowa. Dostępne to: !reset, !stats.";
            }
        }

        if (!rawAnswer) {
            session.emotion += textEmotionScore;
            const negativeWords = ['głupi', 'zły', 'nienawidzę', 'spadaj', 'nudny', 'źle'];
            const positiveWords = ['super', 'fajnie', 'dobrze', 'dzięki', 'kocham', 'świetnie', 'mądry'];

            for (const word of negativeWords) { if (text.includes(word)) session.emotion -= 2; }
            for (const word of positiveWords) { if (text.includes(word)) session.emotion += 2; }

            if (session.emotion < -5) session.emotion = -5;
            if (session.emotion > 5) session.emotion = 5;
        }

        if (!rawAnswer && session.last_response.includes("Nie wiem jak odpowiedzieć na:")) {
            const match = session.last_response.match(/Nie wiem jak odpowiedzieć na: "(.*?)"/);
            if (match && match[1]) {
                const questionToLearn = match[1].toLowerCase();
                try {
                    await db.insert(rethinkdb, conn, "Knowledge", { 
                        question: questionToLearn, answer: originalText, learnedEmotion: session.emotion 
                    });
                    rawAnswer = `Dzięki! Będę to mówił w nastroju na poziomie: ${session.emotion}.`;
                } catch (e) { console.error("Błąd zapisu wyuczonej wiedzy:", e); }
            }
        }

        if (!rawAnswer) {
            if (text.includes("która godzina") || text.includes("jaki czas")) {
                const now = new Date();
                rawAnswer = `Teraz jest ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}.`;
            }
            
            const weatherMatch = text.match(/pogoda w ([\wąćęłńóśźż]+)/);
            if (weatherMatch) {
                try {
                    const city = weatherMatch[1];
                    const wRes = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
                    rawAnswer = `Proszę bardzo: ${wRes.data}`;
                } catch(e) {
                    rawAnswer = "Nie mogłem połączyć się z satelitą pogodowym.";
                }
            }
        }

        if (!rawAnswer) {
            try {
                const cursor = await rethinkdb.table("Knowledge").run(conn);
                const allKnowledge = await cursor.toArray();
                
                const validKnowledge = allKnowledge.filter(k => k && typeof k.question === 'string');

                if (validKnowledge.length > 0) {
                    const questions = validKnowledge.map(k => k.question.toLowerCase());
                    const matches = stringSimilarity.findBestMatch(text, questions);
                    
                    if (matches.bestMatch.rating > 0.65) { 
                        const matchedQuestion = matches.bestMatch.target;
                        const possibleAnswers = validKnowledge.filter(k => k.question.toLowerCase() === matchedQuestion);
                        
                        possibleAnswers.sort((a, b) => Math.abs((a.learnedEmotion || 0) - session.emotion) - Math.abs((b.learnedEmotion || 0) - session.emotion));
                        if (possibleAnswers.length > 0) rawAnswer = possibleAnswers[0].answer;
                    }
                }
            } catch (e) { console.error("Błąd dopasowania Bazy Wiedzy:", e); }
        }

        if (!rawAnswer && /[0-9]/.test(text) && /[+\-*/^()]|sqrt|sin|cos|log/.test(text)) {
            try {
                const allowedMathWords = ['sin', 'cos', 'tan', 'sqrt', 'log', 'pi', 'e'];

                const cleanText = text.replace(/[a-ząćęłńóśźż]+/gi, (word) => {
                    return allowedMathWords.includes(word) ? word : '';
                });

                const mathPattern = /([0-9+\-*/^().,! ]|sin|cos|tan|sqrt|log|pi|e)+/gi;
                const potentialMath = cleanText.match(mathPattern);
                
                if (potentialMath) {
                    const expression = potentialMath.join('').trim();
                    const result = evaluate(expression);
                    
                    if (result !== undefined && typeof result !== 'function') {
                        rawAnswer = `Wynik to: ${result}`;
                    }
                }
            } catch (err) {
                console.error("Błąd podczas obliczeń matematycznych:", err);
            }
        }
        if (!rawAnswer) {
            try {
                let query = originalText.replace(/(co to jest|kto to jest|wyjaśnij|czym są|opowiedz o|definicja)/gi, "").trim();
                if (/(on|ona|ono|jego|jej)/i.test(query) && session.last_topic && session.last_topic !== "") {
                    query = session.last_topic; 
                }

                if (query.length > 2) {
                    const url = `https://pl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
                    const response = await axios.get(url, { headers: { 'User-Agent': 'NotCleverBot/3.0' } });
                    if (response.data && response.data.extract) {
                        rawAnswer = `Z Wikipedii: ${response.data.extract}`;
                        session.last_topic = query; 
                    }
                }
            } catch (error) {}
        }

        if (!rawAnswer) {
            rawAnswer = `Nie wiem jak odpowiedzieć na: "${originalText}". Co mam na to mówić?`;
        }

        let finalResponse = rawAnswer;
        if (!text.startsWith("!") && !rawAnswer.includes("Nie wiem jak")) {
            if (session.emotion <= -3) finalResponse = `Ech, niech ci będzie... ${rawAnswer}`;
            else if (session.emotion >= 3) finalResponse = `Jasne! ${rawAnswer} 😊`;
        }

        session.history.push(originalText);
        if (session.history.length > 5) session.history.shift(); 

        try {
            await rethinkdb.table("Sessions").get(session.id).update({
                emotion: session.emotion,
                last_response: finalResponse,
                history: session.history,
                last_topic: session.last_topic || ""
            }).run(conn);
        } catch (e) { console.error("Błąd aktualizacji sesji na samym dole:", e); }

        return finalResponse;
    }
}