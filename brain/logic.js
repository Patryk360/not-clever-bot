const { normalizeChatText } = require('./utils');
const { getSession, updateSession } = require('./databaseHelper');
const { handleCommands } = require('./commandsHandler');
const { handleMemory, updateEmotion, applyModifiers } = require('./personality');
const { handleTime, handleWeather, handleMath, handleWikipedia, handleMinigames } = require('./features');
const { handleNaturalLearning, findAnswer } = require('./knowledge');

module.exports = {
    solverLogic: async (sentence, apiKey, textEmotionScore, db, conn, rethinkdb) => {
        const rawText = sentence.toLowerCase().trim();
        const text = normalizeChatText(rawText); 
        const originalText = sentence.trim();

        let session = await getSession(apiKey, db, conn, rethinkdb);
        let rawAnswer = null;

        rawAnswer = await handleCommands(text, originalText, session, db, conn, rethinkdb);
        
        if (!rawAnswer) rawAnswer = handleMemory(rawText, session);
        
        if (!rawAnswer) {
            updateEmotion(text, session, textEmotionScore);
        }

        if (!rawAnswer) rawAnswer = handleMinigames(text, session);
        if (!rawAnswer) rawAnswer = await handleNaturalLearning(text, originalText, session, db, conn, rethinkdb);
        if (!rawAnswer) rawAnswer = handleTime(text);
        if (!rawAnswer) rawAnswer = await handleWeather(rawText);
        if (!rawAnswer) rawAnswer = handleMath(rawText);
        if (!rawAnswer) rawAnswer = await handleWikipedia(originalText, session);
        if (!rawAnswer) rawAnswer = await findAnswer(text, session, conn, rethinkdb);

        if (!rawAnswer) {
            rawAnswer = `Nie wiem jak odpowiedzieć na: "${originalText}". Co mam na to mówić?`;
            session.last_matched = ""; 
        }

        const finalResponse = applyModifiers(text, rawAnswer, session);
        await updateSession(session, originalText, finalResponse, conn, rethinkdb);

        return finalResponse;
    }
}