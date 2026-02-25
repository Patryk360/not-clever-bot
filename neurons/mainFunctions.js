const { solverEmotion } = require("./emotions.js");
const { solverLogic } = require("./logic.js");

module.exports = {
    solver: async (sentesence, db, conn, rethinkdb) => { 
        const resE = await solverEmotion(sentesence);
        const doneResponse = await solverLogic(sentesence, resE, db, conn, rethinkdb); 
        return doneResponse;
    }
}