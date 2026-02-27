const { solverEmotion } = require("./emotions.js");
const { solverLogic } = require("./logic.js");

module.exports = {
    solver: async (sentesence, apiKey, db, conn, rethinkdb) => { 
        const textEmotionScore = await solverEmotion(sentesence);

        const doneResponse = await solverLogic(sentesence, apiKey, textEmotionScore, db, conn, rethinkdb); 
        return doneResponse;
    }
}