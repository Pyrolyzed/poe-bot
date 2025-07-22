const https = require("https");

const url = "https://www.poewiki.net/w/api.php";

const get = (url) => {
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
}

const getPage = async (page) => {
    const query = new URLSearchParams({
        action: "opensearch",
        format: "json",
        search: page,
    });
    const fullUrl = `${url}?${query.toString()}`;
    
    const rawData = await get(fullUrl);
    const data = JSON.parse(rawData);
    const matchesIndex = 3;

    const matches = data[matchesIndex];
    return matches.length > 0 ? matches[0] : null;
}

module.exports = { get, getPage };
