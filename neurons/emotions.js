const { sentesenceChecker } = require("./listofsentesences.js");
const { wordChecker } = require("./listofwords.js");

module.exports = {
    solverEmotion: async (sentesence) => {
        const sentesenceCount = await sentesenceChecker(sentesence);
        
        if (sentesenceCount !== false) {
            return sentesenceCount;
        }

        const words = sentesence.split(" ");
        let totalEmotion = 0;
        let foundWords = 0;

        for (const word of words) {
            const wordCount = await wordChecker(word.toLowerCase());
            if (wordCount !== false) {
                totalEmotion += wordCount;
                foundWords++;
            }
        }

        if (foundWords > 0) {
            return (totalEmotion / foundWords);
        }

        return 0;
    }
}