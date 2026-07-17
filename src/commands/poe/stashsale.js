const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://poedb.tw/us/";
function getCountdown(unixTimestamp) {
    const targetDate = new Date(parseInt(unixTimestamp) * 1000);
    const now = new Date();

    const diff = targetDate - now;

    if (diff <= 0) return "Event started";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
module.exports = {
    data: new SlashCommandBuilder().setName("stashtabsale").setDescription("Get the date of the next stash tab sale."),
    async execute(interaction) {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });
        const $ = cheerio.load(data);
        const body = $("h5.card-header")
            .filter((_, el) => $(el).text().includes("Stash Tab"))
            .siblings(".card-body");
        const timestamp = getCountdown(body.find("[data-displaytime]").attr("data-displaytime"));
        await interaction.reply("The next stash tab sale is in " + timestamp);
    }
};
