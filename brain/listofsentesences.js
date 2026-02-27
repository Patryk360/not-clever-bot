const sentesences = require("../resources/texts/defaultSentesences.json");
module.exports = {
    sentesenceChecker: async (sentesence) => {
        const data = await sentesences.find(data => data.sentesence === sentesence);
        if (!data) return false;
        return data.count;
    }
}