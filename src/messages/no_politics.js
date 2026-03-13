module.exports = {
    name: "!!RTFR",
    async execute(client, message) {
        if (message.reference) {
            const referenceMessage = await message.fetchReference()
            referenceMessage.reply(`<@${referenceMessage.author.id}> Read the fucking rules: https://discord.com/channels/637184660496973834/719875122583961662`);
        } else {
            message.reply("Read the fucking rules: https://discord.com/channels/637184660496973834/719875122583961662")
        }
    }
}
