const ascendancies = require("../../../data/ascendancies.json");
const { getPage } = require("../../lib/wiki");
const { getRandomValue } = require("../../lib/random");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName("randomascendancy").setDescription("Roll for a random ascendancy"),
    async execute(interaction) {
        const ascendancy = getRandomValue(ascendancies.ascendancies);
        const page = await getPage(ascendancy, "https://www.poewiki.net/w/api.php");
        message.reply("Random ascendancy: " + page);
    }
};
