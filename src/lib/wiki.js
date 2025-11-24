const https = require("https");


const WIKI_URL = "https://www.poewiki.net/w/api.php";


module.exports = {
    get: (url) => {
        return new Promise((resolve, reject) => {
            let data = "";

            https.get(url, response => {
                response.on("data", chunk => {
                    data += chunk;
                });

                response.on("end", () => {
                    resolve(data);
                });

                response.on("error", err => {
                    reject(err);
                });
            }).on("error", err => {
                reject(err);
            });
        });
    },

    getPage: async (page) => {
        const query = new URLSearchParams({
            action: "opensearch",
            format: "json",
            search: page,
        });
        const fullUrl = `${WIKI_URL}?${query.toString()}`;

        const rawData = await get(fullUrl);
        const data = JSON.parse(rawData);
        const matchesIndex = 3;

        const matches = data[matchesIndex];
        return matches.length > 0 ? matches[0] : null;
    }
};
