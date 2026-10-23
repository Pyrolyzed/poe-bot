const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://poedb.tw/us/";

// Returns { timestamp, label } where label is poedb's text, e.g. "Starts in" (or "Ends in" while a sale runs)
async function getNextSale() {
    const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
        },
    });
    const $ = cheerio.load(data);
    const body = $("h5.card-header")
        .filter((_, el) => $(el).text().includes("Stash Tab"))
        .siblings(".card-body");
    const timestamp = Number(body.find("[data-displaytime]").attr("data-displaytime"));
    const label = body.find("a").first().text().trim();
    return { timestamp, label };
}

module.exports = {
    getNextSale,
    data: new SlashCommandBuilder().setName("stashtabsale").setDescription("Get the date of the next stash tab sale."),
    async execute(interaction) {
        const { timestamp } = await getNextSale();
        await interaction.reply(`The next stash tab sale is at <t:${timestamp}:f> or <t:${timestamp}:R>`);
    }
};
