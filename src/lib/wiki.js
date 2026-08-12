const https = require("https");

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
const getPage = async (page, url) => {
    const searchQuery = new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: page,
        format: "json"
    });

    const searchData = JSON.parse(
        await get(`${url}?${searchQuery.toString()}`)
    );

    const results = searchData.query.search;
    if (!results || results.length === 0) {
        return null;
    }

    const title = results[0].title;

    const resolveQuery = new URLSearchParams({
        action: "query",
        titles: title,
        redirects: "1",
        format: "json"
    });

    const resolveData = JSON.parse(
        await get(`${url}?${resolveQuery.toString()}`)
    );

    const pages = resolveData.query.pages;
    const pageObject = Object.values(pages)[0];

    return `${url.replace("/w/api.php", "")}/wiki/${encodeURIComponent(pageObject.title).replaceAll("%20", "_")}`;
};
module.exports = { get, getPage }
