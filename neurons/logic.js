const { evaluate } = require('mathjs');
module.exports = {
    solverLogic: async (sentesence, resE) => {
        let calculationsQuestion = false;
        let result = "";
        if (sentesence.includes("*")) {
            calculationsQuestion = true;
        } else if (sentesence.includes("/")) {
            calculationsQuestion = true;
        } else if (sentesence.includes("+")) {
            calculationsQuestion = true;
        } else if (sentesence.includes("-")) {
            calculationsQuestion = true;
        }
        if (calculationsQuestion) return resE + " " + evaluate(result);
    }
}