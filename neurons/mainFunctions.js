const { solverEmotion } = require("./emotions.js");
const { solverLogic } = require("./logic.js");
module.exports = {
    solver: async (sentesence) => {
        const resE = await solverEmotion(sentesence);
        const doneResponse = await solverLogic(sentesence, resE);
        return doneResponse;
    }
}