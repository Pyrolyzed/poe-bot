module.exports = {
  name: "!!veterans",
  async execute(client, message) {
    if (message.reference) {
      const referenceMessage = await message.fetchReference();
      referenceMessage.reply(
        `<@${referenceMessage.author.id}> https://discord.com/channels/637184660496973834/972614921273614336/1482884195154923642`,
      );
    } else {
      message.reply(
        "https://discord.com/channels/637184660496973834/972614921273614336/1482884195154923642",
      );
    }
  },
};
