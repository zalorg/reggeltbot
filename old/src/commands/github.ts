import * as Discord from "discord.js";

module.exports = {
  name: "github",
  async execute(message: any, args: any[], bot: any) {
    const collector = new Discord.MessageCollector(
      message.channel,
      (m) => m.author.id === message.author.id,
      { time: 10000 }
    );
    collector.on("collect", (message) => {});

    let filter = (m: any) => m.author.id === message.author.id;
    message.channel
      .send(`Are you sure to delete all data? \`YES\` / \`NO\``)
      .then(() => {
        message.channel
          .awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ["time"],
          })
          .then((message: any) => {
            message = message.first();
            if (
              message.content.toUpperCase() == "YES" ||
              message.content.toUpperCase() == "Y"
            ) {
              message.channel.send(`Deleted`);
            } else if (
              message.content.toUpperCase() == "NO" ||
              message.content.toUpperCase() == "N"
            ) {
              message.channel.send(`Terminated`);
            } else {
              message.channel.send(`Terminated: Invalid Response`);
            }
          })
          .catch((collected: any) => {
            message.channel.send("Timeout");
          });
      });
    if (args[0] === "issues") {
      if (args[1] === "open") {
      }
    }
  },
};
