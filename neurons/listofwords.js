const words = require("../resources/texts/defaultWords.json");
module.exports = {
    wordChecker: async (word) => {
        const data = await words.find(data => data.word === word);
        if (!data) return false;
        return data.count;
    }
}