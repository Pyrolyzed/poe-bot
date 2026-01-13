const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("../config.json");
const { getPage } = require("./lib/wiki");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, client => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return false;
    const matches = [...message.toString().matchAll(/\[\[([^[\]]+?)\]\]/g)].map(m => m[1]);
    matches.forEach(async match => {
        const page = await getPage(match);
        if (page == null) {
            message.reply("Page not found!");
            return false;
        }
        message.reply(page);
    });
});

client.login(token);
