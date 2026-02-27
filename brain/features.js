const axios = require('axios');
const { evaluate } = require('mathjs');
const { normalizeCityName } = require('./utils');

module.exports = {
    handleTime: (text) => {
        if (text.includes("która godzina") || text.includes("jaki czas")) {
            const now = new Date();
            return `Teraz jest ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}.`;
        }
        return null;
    },

    handleWeather: async (rawText) => {
        const weatherMatch = rawText.match(/pogoda w ([\wąćęłńóśźż\-]+)/);
        if (weatherMatch) {
            try {
                const normalizedCity = normalizeCityName(weatherMatch[1]);
                const wRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalizedCity)}&units=metric&lang=pl&appid=4deb9dcf70035bbbc4d319e3d3ed6034`);
                return `W mieście ${normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1)} jest teraz ${Math.round(wRes.data.main.temp)}°C i ${wRes.data.weather[0].description}.`;
            } catch(e) { return "Nie mogłem znaleźć takiego miasta na mapie radarowej."; }
        }
        return null;
    },

    handleMath: (rawText) => {
        if (/[0-9]/.test(rawText) && /[+\-*/^()]|sqrt|sin|cos|log/.test(rawText)) {
            try {
                const cleanText = rawText.replace(/[a-ząćęłńóśźż]+/gi, (word) => ['sin', 'cos', 'tan', 'sqrt', 'log', 'pi', 'e'].includes(word) ? word : '');
                const expression = cleanText.match(/([0-9+\-*/^().,! ]|sin|cos|tan|sqrt|log|pi|e)+/gi).join('').trim();
                const result = evaluate(expression);
                if (result !== undefined) return `Z moich obliczeń wynika, że to: ${result}`;
            } catch (err) {}
        }
        return null;
    },

    handleWikipedia: async (originalText, session) => {
        try {
            const wikiTriggers = /(co to (jest|są)|kto to (jest|są)|wyjaśnij|czym (jest|są)|opowiedz o|definicja)/gi;
            let query = "";

            if (wikiTriggers.test(originalText)) {
                query = originalText.replace(wikiTriggers, "").replace(/\?/g, "").trim();
            } else if (/(on|ona|ono|jego|jej)/i.test(originalText) && session.last_topic && originalText.includes("?")) {
                query = session.last_topic; 
            }

            if (query.length > 2) {
                const axiosConfig = { headers: { 'User-Agent': 'NotCleverBot/3.0 (Discord Bot)' } };
                const searchUrl = `https://pl.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
                const searchRes = await axios.get(searchUrl, axiosConfig); 

                if (searchRes.data && searchRes.data.query && searchRes.data.query.search.length > 0) {
                    const bestTitle = searchRes.data.query.search[0].title;
                    const summaryUrl = `https://pl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle.replace(/ /g, "_"))}`;
                    const response = await axios.get(summaryUrl, axiosConfig);
                    
                    if (response.data && response.data.extract) {
                        session.last_topic = bestTitle; 
                        return `Z Wikipedii: ${response.data.extract}`;
                    }
                }
            }
        } catch (error) { console.error("Błąd Wikipedii:", error.message); }
        return null;
    },

    handleMinigames: (text, session) => {
        if (text.includes("rzut monetą") || text.includes("rzuć monetą")) {
            const wynik = Math.random() > 0.5 ? "orzeł" : "reszka";
            if (session.emotion <= -4) {
                return `Rzucam... Wypadł ${wynik}, ale wiesz co? Zabieram tę monetę. Radź sobie sam.`;
            } else {
                return `Rzuciłem wirtualną monetą! Wypada: **${wynik.toUpperCase()}**!`;
            }
        }
        return null;
    }
}