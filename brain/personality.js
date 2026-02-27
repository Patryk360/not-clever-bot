module.exports = {
    handleMemory: (rawText, session) => {
        const nameMatch = rawText.match(/(na imię mam|jestem) ([a-ząćęłńóśźż]+)/i);
        if (nameMatch && !rawText.includes("kim")) {
            const imie = nameMatch[2].charAt(0).toUpperCase() + nameMatch[2].slice(1);
            session.memory.name = imie;
            return `Zapamiętam to! Miło mi Cię poznać, ${imie}.`;
        }
        if ((rawText.includes("jak mam na imię") || rawText.includes("kim jestem")) && session.memory.name) {
            return `Przecież mówiłeś mi, że jesteś ${session.memory.name}!`;
        }
        return null;
    },

    updateEmotion: (text, session, textEmotionScore) => {
        let emotionMod = textEmotionScore;
        const negativeWords = ['głupi', 'zły', 'nienawidzę', 'spadaj', 'nudny', 'źle'];
        const positiveWords = ['super', 'fajnie', 'dobrze', 'dzięki', 'kocham', 'świetnie', 'mądry'];

        for (const word of negativeWords) { if (text.includes(word)) emotionMod -= 2; }
        for (const word of positiveWords) { if (text.includes(word)) emotionMod += 2; }

        if (session.personality === "mruk") {
            if (emotionMod > 0) emotionMod = Math.floor(emotionMod / 2); 
            if (emotionMod < 0) emotionMod *= 2; 
        } else if (session.personality === "optymista") {
            if (emotionMod > 0) emotionMod *= 2; 
            if (emotionMod < 0) emotionMod = Math.floor(emotionMod / 2); 
        }

        session.emotion += emotionMod;
        if (session.emotion < -5) session.emotion = -5;
        if (session.emotion > 5) session.emotion = 5;
    },

    applyModifiers: (text, rawAnswer, session) => {
        if (text.startsWith("!") || rawAnswer.includes("Nie wiem jak")) return rawAnswer;
        if (session.emotion <= -3) return `Ech... ${rawAnswer}`;
        if (session.emotion >= 3) return `${rawAnswer} 😊`;
        return rawAnswer;
    }
}