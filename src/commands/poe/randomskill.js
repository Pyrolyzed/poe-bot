const skills = require("../../../data/skills.json");
const { getPage } = require("../../lib/wiki")
const { getRandomValue } = require("../../lib/random")
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName("randomskill").setDescription("Roll for a random skill"),
    async execute(interaction) {
        const skill = getRandomValue(skills.skills);
        const page = await getPage(skill, "https://www.poewiki.net/w/api.php");
        await interaction.reply("Random skill: " + page);
    }
};
