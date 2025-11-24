const path = require("path")
const fs = require("fs")
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("../config.json");
const { getPage } = require("./lib/wiki");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


const messageHandlers = new Map();

const messagesPath = path.join(__dirname, "messages");
const messageFiles = fs.readdirSync(messagesPath).filter(file => file.endsWith(".js"));

for (const file of messageFiles) {
    const filePath = path.join(messagesPath, file);
    const messageModule = require(filePath);

    if (
        typeof messageModule.name === "string" &&
        typeof messageModule.execute === "function"
    ) {
        messageHandlers.set(messageModule.name.toLowerCase(), messageModule);
    }
}


client.once(Events.ClientReady, client => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return false;


    const handler = messageHandlers.get(message.toString().toLowerCase())
    if (handler) {
        handler.execute(client, message)
    }


    // Matches double brackets [[string]] and maps to the the value(s) inside
    const matches = [...message.toString().matchAll(/\[\[([^[\]]+?)\]\]/g)].map(m => m[1]);

    matches.forEach(async match => {
        const page = await getPage(match);
        if (page === null) {
            message.reply("Page not found! Did you make a typo?");
            return false;
        }
        message.reply(page);
    });
});

client.login(token);
