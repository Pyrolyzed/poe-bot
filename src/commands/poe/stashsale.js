const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://poedb.tw/us/";
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
        const timestamp = body.find("[data-displaytime]").attr("data-displaytime");
        await interaction.reply(`The next stash tab sale is at <t:${timestamp}:f>`);
    }
};
