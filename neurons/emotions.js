const { sentesenceChecker } = require("./listofsentesences.js");
const { wordChecker } = require("./listofwords.js");
module.exports = {
    solverEmotion: async (sentesence) => {
        const badorgood = Math.floor(Math.random() * (Math.floor(1) - Math.ceil(0) + 1) + Math.ceil(0));
        const sentesenceCount = await sentesenceChecker(sentesence);
        if (!sentesenceCount) {
            const wordCount = await wordChecker(sentesence);
        } else {
            return res;
        }
    }
}