const fs = require("fs");
const path = require("path");
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("../config.json");
const { ascendancies } = require("../data/ascendancies.json");
const { skills } = require("../data/skills.json");
const { getRandomValue } = require("./lib/random");
const { getPage } = require("./lib/wiki");
const { getRandomValues } = require("crypto");
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

const POE1_WIKI_URL = "https://www.poewiki.net/w/api.php";
const POE2_WIKI_URL = "https://www.poe2wiki.net/w/api.php"

client.once(Events.ClientReady, client => {
    console.log(`Logged in as ${client.user.tag}`);
});

async function replyWithPage(message, matches, url) {
    matches.forEach(async match => {
        const page = await getPage(match, url);
        if (page == null) {
            message.reply("Page not found! Did you make a typo?");
            return false;
        }
        message.reply(page);
    });
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return false

    // Matches double brackets [[string]] and maps to the the value(s) inside
    const squareMatches = [...message.toString().matchAll(/\[\[([^[\]]+?)\]\]/g)].map(m => m[1]);
    // Same but with parentheses
    const parenthesesMatches = [...message.toString().matchAll(/\(\(([^()]+?)\)\)/g)].map(m => m[1]);

    const handler = messageHandlers.get(message.toString().toLowerCase());
    if (handler) {
        handler.execute(client, message);
    }

    if (message.toString().toLowerCase() === "!!tradeorssf") {
        const doSSF = (Math.random() < 0.5) ? "SSF" : "Trade";
        message.reply("Play " + doSSF);
    }

    if (message.toString().toLowerCase() === "!!randomskill") {
        console.log(skills)
        const skill = getRandomValue(skills);
        const page = await getPage(skill, POE1_WIKI_URL);
        console.log(skill)
        message.reply("Random skill: " + page);
    }

    if (message.toString().toLowerCase() === "!!randomascendancy") {
        const ascendancy = getRandomValue(ascendancies);
        const page = await getPage(ascendancy, POE1_WIKI_URL);
        console.log(ascendancy)
        message.reply("Random ascendancy: " + page);
    }

    await replyWithPage(message, squareMatches, POE1_WIKI_URL);
    await replyWithPage(message, parenthesesMatches, POE2_WIKI_URL);
});

client.login(token);
