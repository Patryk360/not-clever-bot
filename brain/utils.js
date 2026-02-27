module.exports = {
    normalizeChatText: (text) => {
        let cleanText = text.toLowerCase().replace(/[.,?!]/g, "").trim();
        const synonyms = {
            "siema": "cześć", "hej": "cześć", "witaj": "cześć", "elo": "cześć",
            "nara": "pa", "dobranoc": "pa", "żegnaj": "pa",
            "spoko": "dobrze", "okej": "dobrze", "ok": "dobrze"
        };
        return cleanText.split(" ").map(word => synonyms[word] || word).join(" ").trim();
    },

    normalizeCityName: (city) => {
        const c = city.toLowerCase().trim();
        const exceptions = {
            "warszawie": "warszawa", "krakowie": "kraków", "wrocławiu": "wrocław",
            "łodzi": "łódź", "poznaniu": "poznań", "gdańsku": "gdańsk",
            "szczecinie": "szczecin", "bydgoszczy": "bydgoszcz", "lublinie": "lublin"
        };
        if (exceptions[c]) return exceptions[c];
        if (c.endsWith("dzie")) return c.slice(0, -4) + "d";
        if (c.endsWith("cach")) return c.slice(0, -4) + "ce";
        if (c.endsWith("owie")) return c.slice(0, -4) + "ów";
        if (c.endsWith("wiu")) return c.slice(0, -3) + "w";
        if (c.endsWith("niu")) return c.slice(0, -3) + "ń";
        if (c.endsWith("ku") || c.endsWith("gu") || c.endsWith("u")) return c.slice(0, -1);
        if (c.endsWith("ie")) return c.slice(0, -2);
        return c;
    }
}