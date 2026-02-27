const stringSimilarity = require('string-similarity');
const { normalizeChatText } = require('./utils');

module.exports = {
    handleNaturalLearning: async (text, originalText, session, db, conn, rethinkdb) => {
        if (session.last_response && session.last_response.includes("Nie wiem jak odpowiedzieć na:")) {
            if (["anuluj", "!anuluj", "nie wiem"].includes(text)) {
                return "Okej, zapominam o tym pytaniu. Zmieńmy temat!";
            } else {
                const match = session.last_response.match(/Nie wiem jak odpowiedzieć na: "(.*?)"/);
                if (match && match[1]) {
                    const questionToLearn = normalizeChatText(match[1]);
                    if (questionToLearn.length > 0) {
                        try {
                            await db.insert(rethinkdb, conn, "Knowledge", { 
                                question: questionToLearn, answer: originalText, learnedEmotion: session.emotion 
                            });
                            return `Dzięki! Zrozumiałem. Będę to mówił w nastroju na poziomie: ${session.emotion}.`;
                        } catch (e) { console.error("Błąd zapisu wyuczonej wiedzy:", e); }
                    } else return "Zbyt krótka lub niejasna fraza, abym mógł ją zapamiętać. Zmieńmy temat.";
                }
            }
        }
        return null;
    },

    findAnswer: async (text, session, conn, rethinkdb) => {
        try {
            const cursor = await rethinkdb.table("Knowledge").run(conn);
            const allKnowledge = await cursor.toArray();
            const validKnowledge = allKnowledge.filter(k => k && typeof k.question === 'string' && k.question.length > 0);

            if (validKnowledge.length > 0 && text.length > 0) {
                const questions = validKnowledge.map(k => k.question);
                const matches = stringSimilarity.findBestMatch(text, questions);
                
                if (matches.bestMatch.rating > 0.65) { 
                    const matchedQuestion = matches.bestMatch.target;
                    session.last_matched = matchedQuestion; 

                    const possibleAnswers = validKnowledge.filter(k => k.question === matchedQuestion);
                    if (possibleAnswers.length > 0) {
                        possibleAnswers.forEach(ans => ans.emotionDistance = Math.abs((ans.learnedEmotion || 0) - session.emotion));
                        possibleAnswers.sort((a, b) => a.emotionDistance - b.emotionDistance);
                        
                        const topCandidates = possibleAnswers.filter(ans => ans.emotionDistance <= possibleAnswers[0].emotionDistance + 1);
                        return topCandidates[Math.floor(Math.random() * topCandidates.length)].answer;
                    }
                }
            }
        } catch (e) { console.error("Błąd bazy wiedzy:", e); }
        return null;
    }
}